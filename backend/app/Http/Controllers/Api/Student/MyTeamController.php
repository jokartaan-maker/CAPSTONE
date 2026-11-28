<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\TransferLeadershipRequest;
use App\Http\Resources\Student\MyTeamResource;
use App\Models\AcademicTerm;
use App\Models\Task;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MyTeamController extends Controller
{
    // العلاقات التي يحتاجها MyTeamResource
    private const WITH = ['members.student', 'idea', 'supervisor', 'academicTerm'];

    // GET /api/student/my-team
    // فريق الطالب في الفصل الحالي، أو null إن لم يكن في فريق
    public function show(Request $request): JsonResponse
    {
        $membership = $this->myMembership($request);

        if (! $membership) {
            return response()->json([
                'team'    => null,
                'message' => 'لست عضواً في أي فريق حالياً، أنشئ فريقاً أو انضم لفريق موجود',
            ]);
        }

        return response()->json([
            'team' => new MyTeamResource(Team::with(self::WITH)->find($membership->team_id)),
        ]);
    }

    // POST /api/student/team/leave
    // مغادرة الفريق. القائد: ينقل القيادة أولاً، أو يُحذف الفريق إذا كان وحده
    public function leave(Request $request): JsonResponse
    {
        $membership = $this->myMembership($request);

        if (! $membership) {
            return $this->fail('لست عضواً في أي فريق');
        }

        $result = DB::transaction(function () use ($membership) {
            // قفل صف الفريق: لا تتداخل المغادرة مع قبول عضو جديد أو نقل القيادة
            $team         = Team::query()->lockForUpdate()->find($membership->team_id);
            $membersCount = $team->members()->count();

            // عضو عادي ← يغادر مباشرة
            if ($membership->role === 'member') {
                $this->unassignTasks($membership);
                $membership->delete();
                return ['left', $team->name];
            }

            // قائد ومعه أعضاء ← يجب نقل القيادة أولاً
            if ($membersCount > 1) {
                return ['must_transfer', $team->name];
            }

            // قائد وحده ← يُحذف الفريق (العضويات والطلبات تُحذف معه بـ cascade) وتعود الفكرة متاحة
            $team->delete();
            return ['deleted', $team->name];
        });

        [$status, $teamName] = $result;

        return match ($status) {
            'left'          => response()->json(['message' => 'غادرت فريق «' . $teamName . '»']),
            'must_transfer' => $this->fail('أنت قائد الفريق، انقل القيادة لعضو آخر قبل المغادرة'),
            'deleted'       => response()->json(['message' => 'غادرت فريق «' . $teamName . '» وتم حذفه لأنك كنت العضو الوحيد، والفكرة أصبحت متاحة']),
        };
    }

    // DELETE /api/student/team/members/{studentId}
    // القائد يزيل عضواً من الفريق
    public function removeMember(Request $request, int $studentId): JsonResponse
    {
        $membership = $this->myMembership($request);

        if (! $membership || $membership->role !== 'leader') {
            return $this->forbidden('هذا الإجراء متاح لقائد الفريق فقط');
        }

        if ($studentId === $request->user()->id) {
            return $this->fail('لا يمكنك إزالة نفسك، استخدم مغادرة الفريق');
        }

        $target = TeamMember::with('student')
            ->where('team_id', $membership->team_id)
            ->where('student_id', $studentId)
            ->first();

        if (! $target) {
            return $this->notFound('هذا الطالب ليس عضواً في فريقك');
        }

        $this->unassignTasks($target);
        $target->delete();

        return response()->json([
            'message' => 'تمت إزالة ' . $target->student->name . ' من الفريق',
            'team'    => new MyTeamResource(Team::with(self::WITH)->find($membership->team_id)),
        ]);
    }

    // POST /api/student/team/transfer-leadership   { student_id }
    // القائد ينقل القيادة لعضو آخر، ويصبح هو عضواً عادياً
    public function transferLeadership(TransferLeadershipRequest $request): JsonResponse
    {
        $membership = $this->myMembership($request);

        if (! $membership || $membership->role !== 'leader') {
            return $this->forbidden('هذا الإجراء متاح لقائد الفريق فقط');
        }

        $studentId = (int) $request->validated('student_id');

        if ($studentId === $request->user()->id) {
            return $this->fail('أنت قائد الفريق بالفعل');
        }

        $newLeader = TeamMember::with('student')
            ->where('team_id', $membership->team_id)
            ->where('student_id', $studentId)
            ->first();

        if (! $newLeader) {
            return $this->notFound('هذا الطالب ليس عضواً في فريقك');
        }

        // التبديل داخل transaction: الفريق لا يبقى أبداً بلا قائد أو بقائدين
        DB::transaction(function () use ($membership, $newLeader) {
            Team::query()->lockForUpdate()->find($membership->team_id);

            $membership->update(['role' => 'member']);
            $newLeader->update(['role' => 'leader']);
        });

        return response()->json([
            'message' => 'تم نقل القيادة إلى ' . $newLeader->student->name . '، وأصبحت عضواً في الفريق',
            'team'    => new MyTeamResource(Team::with(self::WITH)->find($membership->team_id)),
        ]);
    }

    // ---------- دوال مساعدة ----------

    // مهام العضو المغادر/المُزال تبقى بلا مسؤول حتى يعيد القائد إسنادها
    private function unassignTasks(TeamMember $member): void
    {
        Task::where('team_id', $member->team_id)
            ->where('assigned_to', $member->student_id)
            ->update(['assigned_to' => null]);
    }

    // عضوية الطالب الحالي في الفصل الحالي
    private function myMembership(Request $request): ?TeamMember
    {
        $term = AcademicTerm::current();

        return $term ? $request->user()->membershipInTerm($term->id) : null;
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
