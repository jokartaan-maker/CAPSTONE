<?php

namespace App\Http\Resources\Student;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// شكل الفكرة في الـ JSON، مطابق لنوع Idea في frontend/src/types/api.ts
class IdeaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'code'             => $this->code,
            'title'            => $this->title,
            'field'            => $this->field,
            'status'           => $this->status,
            'supervisor'       => $this->supervisor?->name,
            'supervisor_email' => $this->supervisor?->email,
            'supervisor_title' => $this->supervisor
                ? $this->supervisor->academicTitleLabel() . ' — ' . $this->supervisor->specialization
                : null,
            'tags'             => $this->tags ?? [],
            'teams'            => [],   // تُملأ في فكرة الفرق
            'description'      => $this->description,
            'problem'          => $this->problem,
            'features'         => $this->features ?? [],
            'requirements'     => $this->requirements ?? [],
            'tech_stack'       => $this->tech_stack ?? [],
            'approved_at'      => $this->approved_at?->toDateString(),
            'approved_by'      => $this->status === 'approved' ? 'اللجنة العلمية' : null,
            'academic_term'    => $this->academicTerm?->name,
            'is_mine'          => $this->proposed_by_student_id !== null
                && $this->proposed_by_student_id === $request->user()?->id,
        ];
    }
}
