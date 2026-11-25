<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\AvailableStudentsRequest;
use App\Http\Requests\Student\InviteStudentRequest;
use App\Http\Requests\Student\SendJoinRequestRequest;
use App\Http\Resources\Student\JoinRequestResource;
use App\Http\Resources\Student\TeamResource;
use App\Models\AcademicTerm;
use App\Models\JoinRequest;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JoinRequestController extends Controller
{
    // العلاقات التي يحتاجها JoinRequestResource
    private const WITH = ['team.idea', 'team.members', 'student'];

    // =====================================================================
    //  جهة الطالب
    // =====================================================================

    // POST /api/student/teams/{id}/join-requests   { message? }
    // الطالب يطلب الانضمام لفريق
    public function send(SendJoinRequestRequest $request, int $id): JsonResponse
    {
        $student = $request->user();
        $term    = AcademicTerm::current();

        if (! $term) {
            return $this->fail('لا يوجد فصل دراسي فعّال حالياً');
        }

        $team = Team::query()->inCurrentTerm()->find($id);

        if (! $team) {
            return $this->notFound('الفريق غير موجود');
        }

        // 1) الطالب ليس في فريق
        if ($student->membershipInTerm($term->id)) {
            return $this->fail('أنت عضو في فريق بالفعل في هذا الفصل');
        }

        // 2) الفريق فيه مكان
        if ($team->isFull()) {
            return $this->fail('الفريق ممتلئ، لا يمكن إرسال طلب انضمام');
        }

        // 3) لا يوجد طلب/دعوة معلّقة بين الطالب وهذا الفريق
        $pending = $team->joinRequests()->pending()->where('student_id', $student->id)->first();

        if ($pending) {
            return $this->fail($pending->type === 'request'
                ? 'لديك طلب معلّق لهذا الفريق بالفعل'
                : 'هذا الفريق أرسل لك دعوة بالفعل، يمكنك قبولها من صفحة طلباتي');
        }

        // 4) إذا رُفض طلبه من هذا الفريق سابقاً، لا يطلب مرة ثانية في نفس الفصل
        $rejectedBefore = $team->joinRequests()->requests()
            ->where('student_id', $student->id)
            ->where('status', 'rejected')
            ->exists();

        if ($rejectedBefore) {
            return $this->fail('رُفض طلبك من هذا الفريق سابقاً، لا يمكنك الطلب مرة أخرى في هذا الفصل');
        }

        // 5) حد أقصى للطلبات المعلّقة
        $max = config('students.max_pending_join_requests');

        $pendingCount = $student->joinRequests()->requests()->pending()
            ->where('academic_term_id', $term->id)
            ->count();

        if ($pendingCount >= $max) {
            return $this->fail("لديك {$max} طلبات انضمام معلّقة، انتظر الرد أو ألغِ أحدها");
        }

        $joinRequest = JoinRequest::create([
            'team_id'          => $team->id,
            'student_id'       => $student->id,
            'academic_term_id' => $term->id,
            'type'             => 'request',
            'status'           => 'pending',
            'message'          => $request->validated('message'),
        ]);

        return response()->json([
            'message'      => 'تم إرسال طلب الانضمام إلى «' . $team->name . '»، بانتظار رد قائد الفريق',
            'join_request' => new JoinRequestResource($joinRequest->load(self::WITH)),
        ], 201);
    }

    // GET /api/student/my-join-requests
    // طلباتي المرسلة + الدعوات التي وصلتني
    public function mine(Request $request): JsonResponse
    {
        $student = $request->user();

        $all = JoinRequest::query()
            ->where('student_id', $student->id)
            ->with(self::WITH)
            ->latest('id')
            ->get();

        return response()->json([
            'sent_requests'        => JoinRequestResource::collection($all->where('type', 'request')->values()),
            'received_invitations' => JoinRequestResource::collection($all->where('type', 'invitation')->values()),
        ]);
    }

    // =====================================================================
    //  جهة قائد الفريق
    // =====================================================================

    // GET /api/student/students/available?search=&major=
    // الطلاب الذين ليس لديهم فريق في الفصل الحالي (للدعوة)
    public function availableStudents(AvailableStudentsRequest $request): JsonResponse
    {
        $term    = AcademicTerm::current();
        $filters = $request->validated();

        $students = Student::query()
            ->where('is_active', true)
            ->where('id', '!=', $request->user()->id)
            ->whereDoesntHave('teamMemberships', fn ($q) => $q->where('academic_term_id', $term?->id))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('university_number', 'like', "%{$search}%");
                });
            })
            ->when($filters['major'] ?? null, fn ($query, $major) => $query->where('major', $major))
            ->orderBy('name')
            ->limit(50)
            ->get();

        return response()->json([
            'students' => $students->map(fn (Student $s) => [
                'id'         => $s->id,
                'name'       => $s->name,
                'major'      => $s->major,
                'study_year' => $s->study_year,
                'skills'     => $s->skills ?? [],
            ])->values(),
            'total'    => $students->count(),
        ]);
    }

    // POST /api/student/team/invitations   { student_id, message? }
    // القائد يدعو طالباً لفريقه
    public function invite(InviteStudentRequest $request): JsonResponse
    {
        $leader = $request->user();
        $term   = AcademicTerm::current();

        if (! $term) {
            return $this->fail('لا يوجد فصل دراسي فعّال حالياً');
        }

        $team = $leader->ledTeamInTerm($term->id);

        if (! $team) {
            return $this->forbidden('هذا الإجراء متاح لقائد الفريق فقط');
        }

        $invited = Student::find($request->validated('student_id'));

        if ($invited->id === $leader->id) {
            return $this->fail('لا يمكنك دعوة نفسك');
        }

        // 1) المدعو ليس في فريق
        if ($invited->membershipInTerm($term->id)) {
            return $this->fail('هذا الطالب عضو في فريق بالفعل');
        }

        // 2) الفريق فيه مكان
        $freeSeats = $team->freeSeats();

        if ($freeSeats === 0) {
            return $this->fail('فريقك ممتلئ، لا يمكن إرسال دعوات');
        }

        // 3) لا يوجد طلب/دعوة معلّقة بين الفريق وهذا الطالب
        $pending = $team->joinRequests()->pending()->where('student_id', $invited->id)->first();

        if ($pending) {
            return $this->fail($pending->type === 'invitation'
                ? 'أرسلت دعوة لهذا الطالب بالفعل'
                : 'هذا الطالب أرسل طلب انضمام لفريقك، يمكنك قبوله من الطلبات الواردة');
        }

        // 4) إذا رفض الطالب دعوة هذا الفريق سابقاً، لا تُرسل مرة ثانية في نفس الفصل
        $rejectedBefore = $team->joinRequests()->invitations()
            ->where('student_id', $invited->id)
            ->where('status', 'rejected')
            ->exists();

        if ($rejectedBefore) {
            return $this->fail('رفض هذا الطالب دعوة فريقك سابقاً، لا يمكن دعوته مرة أخرى في هذا الفصل');
        }

        // 5) الدعوات المعلّقة لا تتجاوز عدد المقاعد الشاغرة
        $pendingInvitations = $team->joinRequests()->invitations()->pending()->count();

        if ($pendingInvitations >= $freeSeats) {
            return $this->fail("لديك {$pendingInvitations} دعوات معلّقة وعدد المقاعد الشاغرة {$freeSeats}، انتظر الردود أو ألغِ دعوة");
        }

        $invitation = JoinRequest::create([
            'team_id'          => $team->id,
            'student_id'       => $invited->id,
            'academic_term_id' => $term->id,
            'type'             => 'invitation',
            'status'           => 'pending',
            'message'          => $request->validated('message'),
        ]);

        return response()->json([
            'message'      => 'تم إرسال الدعوة إلى ' . $invited->name,
            'join_request' => new JoinRequestResource($invitation->load(self::WITH)),
        ], 201);
    }

    // GET /api/student/team/join-requests
    // للقائد: الطلبات الواردة لفريقه + الدعوات التي أرسلها
    public function teamRequests(Request $request): JsonResponse
    {
        $term = AcademicTerm::current();
        $team = $term ? $request->user()->ledTeamInTerm($term->id) : null;

        if (! $team) {
            return $this->forbidden('هذا الإجراء متاح لقائد الفريق فقط');
        }

        $all = $team->joinRequests()->with(self::WITH)->latest('id')->get();

        return response()->json([
            'team'              => ['id' => $team->id, 'name' => $team->name],
            'received_requests' => JoinRequestResource::collection($all->where('type', 'request')->values()),
            'sent_invitations'  => JoinRequestResource::collection($all->where('type', 'invitation')->values()),
        ]);
    }

    // =====================================================================
    //  الرد: قبول / رفض / إلغاء
    //  من يرد؟ طلب (request) ← القائد. دعوة (invitation) ← الطالب المدعو.
    //  من يلغي؟ طلب ← صاحبه. دعوة ← القائد.
    // =====================================================================

    // POST /api/student/join-requests/{id}/accept
    public function accept(Request $request, int $id): JsonResponse
    {
        $joinRequest = JoinRequest::with(self::WITH)->find($id);
        $check       = $this->authorizeAction($request->user(), $joinRequest, 'respond');

        if ($check) {
            return $check;
        }

        try {
            $result = DB::transaction(function () use ($joinRequest) {
                // قفل صف الفريق: قبولان في نفس اللحظة لا يتجاوزان السعة
                $team = Team::query()->lockForUpdate()->find($joinRequest->team_id);

                if (TeamMember::where('student_id', $joinRequest->student_id)
                        ->where('academic_term_id', $joinRequest->academic_term_id)->exists()) {
                    $joinRequest->close('cancelled');
                    return 'student_has_team';
                }

                if ($team->isFull()) {
                    return 'team_full';
                }

                // 1) إضافة الطالب للفريق
                TeamMember::create([
                    'team_id'          => $team->id,
                    'student_id'       => $joinRequest->student_id,
                    'academic_term_id' => $joinRequest->academic_term_id,
                    'role'             => 'member',
                    'joined_at'        => now(),
                ]);

                $joinRequest->close('accepted');

                // 2) باقي طلبات ودعوات الطالب المعلّقة تُلغى (انضم لفريق)
                JoinRequest::query()->pending()
                    ->where('student_id', $joinRequest->student_id)
                    ->where('academic_term_id', $joinRequest->academic_term_id)
                    ->update(['status' => 'cancelled', 'responded_at' => now()]);

                // 3) إذا امتلأ الفريق: الطلبات المعلّقة تُرفض، والدعوات المعلّقة تُلغى
                if ($team->isFull()) {
                    $team->joinRequests()->pending()->requests()
                        ->update(['status' => 'rejected', 'responded_at' => now()]);
                    $team->joinRequests()->pending()->invitations()
                        ->update(['status' => 'cancelled', 'responded_at' => now()]);
                }

                return 'ok';
            });
        } catch (UniqueConstraintViolationException) {
            $result = 'student_has_team';   // سباق نادر: الطالب قُبل في فريق آخر في نفس اللحظة
        }

        if ($result === 'student_has_team') {
            return $this->fail('الطالب أصبح عضواً في فريق آخر، أُلغي هذا الطلب');
        }

        if ($result === 'team_full') {
            return $this->fail('الفريق ممتلئ، لا يمكن القبول');
        }

        $team = Team::with(['members.student', 'idea', 'supervisor', 'academicTerm'])->find($joinRequest->team_id);

        return response()->json([
            'message' => $joinRequest->type === 'request'
                ? 'تم قبول ' . $joinRequest->student->name . ' في الفريق'
                : 'تم قبول الدعوة، أنت الآن عضو في «' . $team->name . '»',
            'team'    => new TeamResource($team),
        ]);
    }

    // POST /api/student/join-requests/{id}/reject
    public function reject(Request $request, int $id): JsonResponse
    {
        $joinRequest = JoinRequest::with(self::WITH)->find($id);
        $check       = $this->authorizeAction($request->user(), $joinRequest, 'respond');

        if ($check) {
            return $check;
        }

        $joinRequest->close('rejected');

        return response()->json([
            'message'      => $joinRequest->type === 'request' ? 'تم رفض طلب الانضمام' : 'تم رفض الدعوة',
            'join_request' => new JoinRequestResource($joinRequest),
        ]);
    }

    // DELETE /api/student/join-requests/{id}
    public function cancel(Request $request, int $id): JsonResponse
    {
        $joinRequest = JoinRequest::with(self::WITH)->find($id);
        $check       = $this->authorizeAction($request->user(), $joinRequest, 'cancel');

        if ($check) {
            return $check;
        }

        $joinRequest->close('cancelled');

        return response()->json([
            'message'      => $joinRequest->type === 'request' ? 'تم إلغاء طلب الانضمام' : 'تم إلغاء الدعوة',
            'join_request' => new JoinRequestResource($joinRequest),
        ]);
    }

    // =====================================================================
    //  دوال مساعدة
    // =====================================================================

    // هل يحق لهذا الطالب الرد (respond) أو الإلغاء (cancel)؟
    // يرجع null إذا مسموح، أو رد خطأ جاهز
    private function authorizeAction(Student $user, ?JoinRequest $joinRequest, string $action): ?JsonResponse
    {
        if (! $joinRequest) {
            return $this->notFound('الطلب غير موجود');
        }

        $isStudent = $joinRequest->student_id === $user->id;
        $isLeader  = TeamMember::where('team_id', $joinRequest->team_id)
            ->where('student_id', $user->id)
            ->where('role', 'leader')
            ->exists();

        // لا علاقة له بالطلب أصلاً ← 404 (لا نكشف وجوده)
        if (! $isStudent && ! $isLeader) {
            return $this->notFound('الطلب غير موجود');
        }

        // الطرف المسموح له حسب النوع والإجراء
        $allowed = match ([$joinRequest->type, $action]) {
            ['request', 'respond']    => $isLeader,    // القائد يرد على طلب
            ['invitation', 'respond'] => $isStudent,   // الطالب يرد على دعوة
            ['request', 'cancel']     => $isStudent,   // الطالب يلغي طلبه
            ['invitation', 'cancel']  => $isLeader,    // القائد يلغي دعوته
        };

        if (! $allowed) {
            return $this->forbidden('لا يمكنك تنفيذ هذا الإجراء على هذا الطلب');
        }

        if (! $joinRequest->isPending()) {
            return $this->fail('لا يمكن تعديل هذا الطلب، حالته: ' . $joinRequest->statusLabel());
        }

        return null;
    }

    private function fail(string $message): JsonResponse
    {
        return response()->json(['message' => $message], 422);
    }

    private function forbidden(string $message): JsonResponse
    {
        return response()->json(['message' => $message], 403);
    }

    private function notFound(string $message): JsonResponse
    {
        return response()->json(['message' => $message], 404);
    }
}
