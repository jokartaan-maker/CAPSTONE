<?php

namespace App\Http\Resources\Student;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// إصدار واحد من تسليم الفريق. يحتاج تحميلاً مسبقاً: uploader و grader
class SubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'version'       => $this->version,
            'original_name' => $this->original_name,
            'size'          => $this->size,
            'size_label'    => $this->readableSize(),
            'mime_type'     => $this->mime_type,
            'notes'         => $this->notes,
            'is_late'       => $this->is_late,
            'submitted_at'  => $this->submitted_at?->toDateTimeString(),
            'uploaded_by'   => $this->uploader ? ['id' => $this->uploader->id, 'name' => $this->uploader->name] : null,

            // التقييم (من المشرف)
            'is_graded'     => $this->isGraded(),
            'grade'         => $this->grade,
            'feedback'      => $this->feedback,
            'graded_by'     => $this->grader?->name,
            'graded_at'     => $this->graded_at?->toDateTimeString(),

            'download_url'  => url("/api/student/submissions/{$this->id}/download"),
        ];
    }
}
