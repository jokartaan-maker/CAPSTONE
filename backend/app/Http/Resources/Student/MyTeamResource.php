<?php

namespace App\Http\Resources\Student;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// صفحة "فريقي": تفاصيل كاملة للفريق كما يراها أحد أعضائه
// يحتاج تحميلاً مسبقاً: members.student و idea و supervisor و academicTerm
class MyTeamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $me       = $request->user();
        $myMember = $this->members->firstWhere('student_id', $me->id);
        $isLeader = $myMember?->role === 'leader';

        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'status'        => $this->status,                       // forming / active / closed
            'members_count' => $this->members->count(),
            'capacity'      => $this->capacity,
            'free_seats'    => max(0, $this->capacity - $this->members->count()),
            'academic_term' => $this->academicTerm?->name,
            'created_at'    => $this->created_at?->toDateString(),

            // دوري أنا في الفريق
            'my_role'       => $myMember?->role,                    // leader / member
            'is_leader'     => $isLeader,

            'idea'          => [
                'id'          => $this->idea->id,
                'code'        => $this->idea->code,
                'title'       => $this->idea->title,
                'field'       => $this->idea->field,
                'description' => $this->idea->description,
                'tech_stack'  => $this->idea->tech_stack ?? [],
            ],

            'supervisor'    => $this->supervisor ? [
                'id'    => $this->supervisor->id,
                'name'  => $this->supervisor->name,
                'email' => $this->supervisor->email,
                'title' => $this->supervisor->academicTitleLabel(),
            ] : null,

            'team_members'  => $this->members->map(fn ($member) => [
                'id'         => $member->student->id,
                'name'       => $member->student->name,
                'email'      => $member->student->email,
                'major'      => $member->student->major,
                'skills'     => $member->student->skills ?? [],
                'role'       => $member->roleLabel(),               // قائد الفريق / عضو
                'role_key'   => $member->role,                      // leader / member
                'is_me'      => $member->student_id === $me->id,
                'joined_at'  => $member->joined_at?->toDateString(),
            ])->values(),

            // للقائد فقط: عدد طلبات الانضمام المعلّقة
            'pending_requests' => $isLeader
                ? $this->joinRequests()->pending()->requests()->count()
                : null,
        ];
    }
}
