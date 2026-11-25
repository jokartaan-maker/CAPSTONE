<?php

namespace App\Http\Resources\Student;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// شكل الفريق في صفحة "استكشاف الفرق"
// يحتاج تحميلاً مسبقاً: members.student و idea و supervisor
class TeamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $leader = $this->members->firstWhere('role', 'leader');

        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'status'        => $this->statusFor($request->user()),   // open / full / your_team
            'members'       => $this->members->count(),
            'capacity'      => $this->capacity,
            'idea'          => [
                'id'    => $this->idea->id,
                'code'  => $this->idea->code,
                'title' => $this->idea->title,
                'field' => $this->idea->field,
            ],
            'supervisor'    => $this->supervisor?->name,
            'leader'        => $leader?->student?->name,
            'team_members'  => $this->members->map(fn ($member) => [
                'id'   => $member->student->id,
                'name' => $member->student->name,
                'role' => $member->roleLabel(),
            ])->values(),
            'academic_term' => $this->academicTerm?->name,
            'created_at'    => $this->created_at?->toDateString(),
        ];
    }
}
