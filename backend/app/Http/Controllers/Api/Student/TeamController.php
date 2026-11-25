<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreTeamRequest;
use App\Http\Requests\Student\TeamExploreRequest;
use App\Http\Resources\Student\TeamResource;
use App\Models\AcademicTerm;
use App\Models\Idea;
use App\Models\Supervisor;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TeamController extends Controller
{
    // العلاقات التي يحتاجها TeamResource (تحميل مسبق يمنع N+1)
    private const WITH = ['members.student', 'idea', 'supervisor', 'academicTerm'];

    // GET /api/student/teams/explore?search=&field=&status=open|full
    // فرق الفصل الحالي مع البحث والتصفية
    public function explore(TeamExploreRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $teams = Team::query()
            ->inCurrentTerm()
            ->with(self::WITH)
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhereHas('idea', fn ($i) => $i->where('title', 'like', "%{$search}%")
                                                        ->orWhere('code', 'like', "%{$search}%"));
                });
            })
            ->when($filters['field'] ?? null, fn ($query, $field) => $query->whereHas('idea', fn ($i) => $i->where('field', $field)))
            ->when(($filters['status'] ?? null) === 'open', fn ($query) => $query->open())
            ->when(($filters['status'] ?? null) === 'full', fn ($query) => $query->full())
            ->latest()
            ->get();

        return response()->json([
            'teams' => TeamResource::collection($teams),
            'total' => $teams->count(),
        ]);
    }

    // POST /api/student/teams   { name, idea_id }
    // إنشاء فريق على فكرة معتمدة، ومنشئ الفريق يصبح قائده
    public function store(StoreTeamRequest $request): JsonResponse
    {
        $student = $request->user();
        $data    = $request->validated();

        // 1) يجب وجود فصل دراسي فعّال
        $term = AcademicTerm::current();

        if (! $term) {
            return $this->fail('لا يوجد فصل دراسي فعّال حالياً، تواصل مع الإدارة');
        }

        // 2) الطالب ليس في فريق آخر في هذا الفصل
        $membership = $student->membershipInTerm($term->id);

        if ($membership) {
            return $this->fail('أنت عضو في فريق «' . $membership->team->name . '» في هذا الفصل، لا يمكنك إنشاء فريق آخر');
        }

        // 3) الفكرة معتمدة وفي الفصل الحالي
        $idea = Idea::query()->approved()->inCurrentTerm()->find($data['idea_id']);

        if (! $idea || ! $idea->supervisor_id) {
            return $this->fail('لا يمكن إنشاء فريق على هذه الفكرة، يجب أن تكون معتمدة من اللجنة وفي الفصل الحالي');
        }

        // 4) الفكرة ليست محجوزة لفريق آخر (فريق واحد لكل فكرة)
        if ($idea->team()->exists()) {
            return $this->fail('هذه الفكرة محجوزة لفريق آخر، اختر فكرة أخرى');
        }

        // 5) الإنشاء داخل transaction
        try {
            $team = DB::transaction(function () use ($data, $student, $idea, $term) {
                // قفل صف المشرف: طلبان في نفس اللحظة لا يتجاوزان max_teams معاً
                $supervisor = Supervisor::query()->lockForUpdate()->find($idea->supervisor_id);

                if ($supervisor->teamsCountInTerm($term->id) >= $supervisor->max_teams) {
                    return null;   // المشرف ممتلئ
                }

                $team = Team::create([
                    'name'             => $data['name'],
                    'idea_id'          => $idea->id,
                    'supervisor_id'    => $supervisor->id,
                    'academic_term_id' => $term->id,
                    'capacity'         => config('students.team_capacity'),
                    'status'           => 'forming',
                ]);

                TeamMember::create([
                    'team_id'          => $team->id,
                    'student_id'       => $student->id,
                    'academic_term_id' => $term->id,
                    'role'             => 'leader',
                    'joined_at'        => now(),
                ]);

                return $team;
            });
        } catch (UniqueConstraintViolationException) {
            // سباق نادر: طلبان في نفس اللحظة على نفس الفكرة/الاسم، أو الطالب أنشأ فريقين معاً
            return $this->fail('تعذّر إنشاء الفريق: الفكرة أو اسم الفريق محجوز، أو أنك أصبحت في فريق بالفعل');
        }

        if (! $team) {
            return $this->fail('المشرف ' . $idea->supervisor->name . ' وصل إلى الحد الأقصى لعدد الفرق، اختر فكرة أخرى');
        }

        $team->load(self::WITH);

        return response()->json([
            'message' => 'تم إنشاء الفريق بنجاح، وأنت قائده',
            'team'    => new TeamResource($team),
        ], 201);
    }

    // رد خطأ موحّد 422
    private function fail(string $message): JsonResponse
    {
        return response()->json(['message' => $message], 422);
    }
}
