<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreTaskRequest;
use App\Http\Requests\Student\TaskIndexRequest;
use App\Http\Requests\Student\UpdateTaskRequest;
use App\Http\Requests\Student\UpdateTaskStatusRequest;
use App\Http\Resources\Student\TaskResource;
use App\Models\AcademicTerm;
use App\Models\Task;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // العلاقات التي يحتاجها TaskResource
    private const WITH = ['assignee', 'creatorStudent', 'creatorSupervisor'];

    // GET /api/student/team/tasks?status=&assignee=me|none|{id}
    // مهام فريقي + ملخص الإنجاز
    public function index(TaskIndexRequest $request): JsonResponse
    {
        $membership = $this->myMembership($request);

        if (! $membership) {
            return $this->forbidden('لست عضواً في أي فريق');
        }

        $filters  = $request->validated();
        $assignee = $filters['assignee'] ?? null;

        $tasks = Task::query()
            ->where('team_id', $membership->team_id)
            ->with(self::WITH)
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($assignee === 'me', fn ($q) => $q->where('assigned_to', $request->user()->id))
            ->when($assignee === 'none', fn ($q) => $q->whereNull('assigned_to'))
            ->when(is_numeric($assignee), fn ($q) => $q->where('assigned_to', (int) $assignee))
            ->orderByRaw("status = 'done'")        // غير المنجزة أولاً
            ->orderByRaw('due_date is null')       // التي لها موعد أولاً
            ->orderBy('due_date')                  // الأقرب موعداً أولاً
            ->latest('id')
            ->get();

        return response()->json([
            'tasks'   => TaskResource::collection($tasks),
            'summary' => $this->summary($membership->team_id),
        ]);
    }

    // POST /api/student/team/tasks   { title, description?, assigned_to?, priority?, due_date? }
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $membership = $this->myMembership($request);

        if (! $membership || $membership->role !== 'leader') {
            return $this->forbidden('إنشاء المهام متاح لقائد الفريق فقط');
        }

        $data = $request->validated();

        $task = Task::create([
            'team_id'               => $membership->team_id,
            'title'                 => $data['title'],
            'description'           => $data['description'] ?? null,
            'assigned_to'           => $data['assigned_to'] ?? null,
            'priority'              => $data['priority'] ?? 'medium',
            'status'                => 'todo',
            'due_date'              => $data['due_date'] ?? null,
            'created_by_student_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'تم إنشاء المهمة',
            'task'    => new TaskResource($task->load(self::WITH)),
        ], 201);
    }

    // PATCH /api/student/team/tasks/{id}   (أي حقل من حقول الإنشاء)
    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $membership = $this->myMembership($request);

        if (! $membership || $membership->role !== 'leader') {
            return $this->forbidden('تعديل المهام متاح لقائد الفريق فقط');
        }

        $task = $this->findTeamTask($membership, $id);

        if (! $task) {
            return $this->notFound('المهمة غير موجودة');
        }

        $task->update($request->validated());

        return response()->json([
            'message' => 'تم تعديل المهمة',
            'task'    => new TaskResource($task->fresh(self::WITH)),
        ]);
    }

    // PATCH /api/student/team/tasks/{id}/status   { status }
    // القائد أو العضو المسؤول عن المهمة
    public function updateStatus(UpdateTaskStatusRequest $request, int $id): JsonResponse
    {
        $membership = $this->myMembership($request);

        if (! $membership) {
            return $this->forbidden('لست عضواً في أي فريق');
        }

        $task = $this->findTeamTask($membership, $id);

        if (! $task) {
            return $this->notFound('المهمة غير موجودة');
        }

        $isLeader   = $membership->role === 'leader';
        $isAssignee = $task->assigned_to === $request->user()->id;

        if (! $isLeader && ! $isAssignee) {
            return $this->forbidden('يمكن تغيير حالة المهمة من قبل المسؤول عنها أو قائد الفريق فقط');
        }

        $task->setStatus($request->validated('status'));

        return response()->json([
            'message' => 'تم تغيير حالة المهمة إلى: ' . $task->statusLabel(),
            'task'    => new TaskResource($task->load(self::WITH)),
            'summary' => $this->summary($membership->team_id),
        ]);
    }

    // DELETE /api/student/team/tasks/{id}
    public function destroy(Request $request, int $id): JsonResponse
    {
        $membership = $this->myMembership($request);

        if (! $membership || $membership->role !== 'leader') {
            return $this->forbidden('حذف المهام متاح لقائد الفريق فقط');
        }

        $task = $this->findTeamTask($membership, $id);

        if (! $task) {
            return $this->notFound('المهمة غير موجودة');
        }

        $task->delete();

        return response()->json([
            'message' => 'تم حذف المهمة',
            'summary' => $this->summary($membership->team_id),
        ]);
    }

    // ---------- دوال مساعدة ----------

    private function myMembership(Request $request): ?TeamMember
    {
        $term = AcademicTerm::current();

        return $term ? $request->user()->membershipInTerm($term->id) : null;
    }

    // المهمة يجب أن تكون من فريق الطالب، وإلا لا نكشف وجودها
    private function findTeamTask(TeamMember $membership, int $id): ?Task
    {
        return Task::where('team_id', $membership->team_id)->find($id);
    }

    // ملخص الإنجاز: العدد حسب الحالة + المتأخرة + النسبة
    private function summary(int $teamId): array
    {
        $counts = Task::where('team_id', $teamId)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $total = (int) $counts->sum();
        $done  = (int) ($counts['done'] ?? 0);

        return [
            'total'       => $total,
            'todo'        => (int) ($counts['todo'] ?? 0),
            'in_progress' => (int) ($counts['in_progress'] ?? 0),
            'done'        => $done,
            'overdue'     => Task::where('team_id', $teamId)
                ->where('status', '!=', 'done')
                ->whereDate('due_date', '<', today())
                ->count(),
            'progress'    => $total === 0 ? 0 : (int) round($done * 100 / $total),   // نسبة الإنجاز %
        ];
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
