<?php

namespace App\Http\Resources\Student;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// موعد تسليم + حالة تسليم فريق الطالب
// الـ Controller يضع إصدارات الفريق في علاقة teamSubmissions (الأحدث أولاً)
class DeadlineResource extends JsonResource
{
    // true في صفحة التفاصيل: نعرض كل الإصدارات
    public bool $withVersions = false;

    public function toArray(Request $request): array
    {
        $versions = $this->relationLoaded('teamSubmissions') ? $this->teamSubmissions : collect();
        $latest   = $versions->first();
        $status   = $this->submissionStatus($latest);

        return [
            'id'                  => $this->id,
            'title'               => $this->title,
            'description'         => $this->description,
            'due_at'              => $this->due_at->toDateTimeString(),
            'is_past'             => $this->isPast(),
            'days_left'           => $this->isPast() ? 0 : (int) now()->diffInDays($this->due_at),
            'allow_late'          => $this->allow_late,
            'accepts_submissions' => $this->acceptsSubmissions() && ! ($latest?->isGraded()),
            'max_score'           => $this->max_score,

            'status'              => $status,                            // not_submitted / missed / submitted / late / graded
            'status_label'        => [
                'not_submitted' => 'لم يُسلَّم',
                'missed'        => 'فات الموعد',
                'submitted'     => 'مُسلَّم',
                'late'          => 'مُسلَّم متأخراً',
                'graded'        => 'مُقيَّم',
            ][$status],
            'versions_count'      => $versions->count(),
            'latest_submission'   => $latest ? new SubmissionResource($latest) : null,
            'versions'            => $this->when($this->withVersions, fn () => SubmissionResource::collection($versions)),
        ];
    }

    private function submissionStatus($latest): string
    {
        if (! $latest) {
            return $this->acceptsSubmissions() ? 'not_submitted' : 'missed';
        }

        if ($latest->isGraded()) {
            return 'graded';
        }

        return $latest->is_late ? 'late' : 'submitted';
    }
}
