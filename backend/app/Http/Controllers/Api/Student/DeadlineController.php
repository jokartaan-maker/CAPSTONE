<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreSubmissionRequest;
use App\Http\Resources\Student\DeadlineResource;
use App\Http\Resources\Student\SubmissionResource;
use App\Models\AcademicTerm;
use App\Models\Deadline;
use App\Models\Submission;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DeadlineController extends Controller
{
    private const DISK = 'local';   // storage/app/private: غير متاح للعامة، التحميل عبر الـ API فقط

    // GET /api/student/deadlines
    // مواعيد الفصل الحالي + حالة تسليم فريقي لكل موعد
    public function index(Request $request): JsonResponse
    {
        $membership = $this->myMembership($request);

        $deadlines = Deadline::query()
            ->inCurrentTerm()
            ->orderBy('due_at')
            ->get();

        $this->attachTeamSubmissions($deadlines, $membership?->team_id);

        return response()->json([
            'has_team'  => $membership !== null,
            'deadlines' => DeadlineResource::collection($deadlines),
        ]);
    }

    // GET /api/student/deadlines/{id}
    // موعد واحد + كل إصدارات تسليم فريقي
    public function show(Request $request, int $id): JsonResponse
    {
        $deadline = Deadline::query()->inCurrentTerm()->find($id);

        if (! $deadline) {
            return $this->notFound('الموعد غير موجود');
        }

        $membership = $this->myMembership($request);
        $this->attachTeamSubmissions(collect([$deadline]), $membership?->team_id);

        $resource               = new DeadlineResource($deadline);
        $resource->withVersions = true;

        return response()->json([
            'has_team' => $membership !== null,
            'deadline' => $resource,
        ]);
    }

    // POST /api/student/deadlines/{id}/submissions   (multipart: file, notes?)
    // رفع إصدار جديد. الإصدارات السابقة تبقى محفوظة
    public function submit(StoreSubmissionRequest $request, int $id): JsonResponse
    {
        $membership = $this->myMembership($request);

        if (! $membership) {
            return $this->forbidden('يجب أن تكون عضواً في فريق لرفع التسليمات');
        }

        $deadline = Deadline::query()->inCurrentTerm()->find($id);

        if (! $deadline) {
            return $this->notFound('الموعد غير موجود');
        }

        // 1) انتهى الموعد ولا يُقبل التأخير
        if (! $deadline->acceptsSubmissions()) {
            return $this->fail('انتهى موعد التسليم ولا يُقبل التسليم المتأخر لهذه المرحلة');
        }

        // 2) إذا قُيّم آخر إصدار، لا يُرفع إصدار جديد
        $latest = Submission::where('deadline_id', $deadline->id)
            ->where('team_id', $membership->team_id)
            ->orderByDesc('version')
            ->first();

        if ($latest?->isGraded()) {
            return $this->fail('تم تقييم هذا التسليم من المشرف، لا يمكن رفع إصدار جديد');
        }

        $file    = $request->file('file');
        $version = ($latest?->version ?? 0) + 1;
        $folder  = "submissions/team_{$membership->team_id}/deadline_{$deadline->id}";
        $name    = "v{$version}_" . Str::uuid() . '.' . strtolower($file->getClientOriginalExtension());

        // 3) حفظ الملف أولاً، ثم السجل. إذا فشل السجل نحذف الملف
        $path = $file->storeAs($folder, $name, self::DISK);

        try {
            $submission = DB::transaction(function () use ($membership, $deadline, $request, $file, $path, $version) {
                // قفل صف الفريق: رفعان في نفس اللحظة لا يأخذان نفس رقم الإصدار
                Team::query()->lockForUpdate()->find($membership->team_id);

                return Submission::create([
                    'deadline_id'   => $deadline->id,
                    'team_id'       => $membership->team_id,
                    'uploaded_by'   => $request->user()->id,
                    'version'       => $version,
                    'file_path'     => $path,
                    'original_name' => Str::limit($file->getClientOriginalName(), 250, ''),
                    'mime_type'     => $file->getMimeType(),
                    'size'          => $file->getSize(),
                    'notes'         => $request->validated('notes'),
                    'is_late'       => $deadline->isPast(),
                    'submitted_at'  => now(),
                ]);
            });
        } catch (UniqueConstraintViolationException) {
            Storage::disk(self::DISK)->delete($path);

            return $this->fail('رفع عضو آخر من فريقك إصداراً في نفس اللحظة، حدّث الصفحة وحاول مرة أخرى');
        } catch (\Throwable $e) {
            Storage::disk(self::DISK)->delete($path);
            throw $e;
        }

        $submission->load(['uploader', 'grader']);

        return response()->json([
            'message'    => "تم رفع الإصدار {$version} بنجاح" . ($submission->is_late ? ' (متأخر)' : ''),
            'submission' => new SubmissionResource($submission),
        ], 201);
    }

    // GET /api/student/submissions/{id}/download
    // تحميل ملف تسليم (لأعضاء الفريق فقط)
    public function download(Request $request, int $id): StreamedResponse|JsonResponse
    {
        $membership = $this->myMembership($request);

        $submission = $membership
            ? Submission::where('team_id', $membership->team_id)->find($id)
            : null;

        if (! $submission) {
            return $this->notFound('الملف غير موجود');
        }

        if (! Storage::disk(self::DISK)->exists($submission->file_path)) {
            return $this->notFound('الملف غير موجود على الخادم');
        }

        return Storage::disk(self::DISK)->download($submission->file_path, $submission->original_name);
    }

    // ---------- دوال مساعدة ----------

    // تحميل إصدارات الفريق لكل موعد باستعلام واحد (الأحدث أولاً)
    private function attachTeamSubmissions($deadlines, ?int $teamId): void
    {
        $byDeadline = $teamId
            ? Submission::query()
                ->where('team_id', $teamId)
                ->whereIn('deadline_id', $deadlines->pluck('id'))
                ->with(['uploader', 'grader'])
                ->orderByDesc('version')
                ->get()
                ->groupBy('deadline_id')
            : collect();

        foreach ($deadlines as $deadline) {
            $deadline->setRelation('teamSubmissions', $byDeadline->get($deadline->id, collect()));
        }
    }

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
