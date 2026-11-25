<?php

namespace App\Http\Resources\Student;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// شكل طلب الانضمام / الدعوة
// يحتاج تحميلاً مسبقاً: team.idea و team.members و student
class JoinRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'type'         => $this->type,                                   // request / invitation
            'type_label'   => $this->type === 'request' ? 'طلب انضمام' : 'دعوة',
            'status'       => $this->status,                                 // pending / accepted / rejected / cancelled
            'status_label' => $this->statusLabel(),
            'message'      => $this->message,
            'team'         => [
                'id'         => $this->team->id,
                'name'       => $this->team->name,
                'idea_code'  => $this->team->idea?->code,
                'idea_title' => $this->team->idea?->title,
                'members'    => $this->team->members->count(),
                'capacity'   => $this->team->capacity,
            ],
            'student'      => [
                'id'         => $this->student->id,
                'name'       => $this->student->name,
                'major'      => $this->student->major,
                'study_year' => $this->student->study_year,
                'skills'     => $this->student->skills ?? [],
            ],
            'created_at'   => $this->created_at?->toDateTimeString(),
            'responded_at' => $this->responded_at?->toDateTimeString(),
        ];
    }
}
