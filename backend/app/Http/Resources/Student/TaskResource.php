<?php

namespace App\Http\Resources\Student;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// شكل المهمة. يحتاج تحميلاً مسبقاً: assignee و creatorStudent و creatorSupervisor
class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $creator = $this->creatorSupervisor
            ? ['name' => $this->creatorSupervisor->name, 'type' => 'supervisor', 'label' => 'المشرف']
            : ($this->creatorStudent
                ? ['name' => $this->creatorStudent->name, 'type' => 'student', 'label' => 'قائد الفريق']
                : null);

        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'description'    => $this->description,
            'status'         => $this->status,                  // todo / in_progress / done
            'status_label'   => $this->statusLabel(),
            'priority'       => $this->priority,                // low / medium / high
            'priority_label' => $this->priorityLabel(),
            'due_date'       => $this->due_date?->toDateString(),
            'is_overdue'     => $this->isOverdue(),
            'completed_at'   => $this->completed_at?->toDateTimeString(),
            'assignee'       => $this->assignee ? ['id' => $this->assignee->id, 'name' => $this->assignee->name] : null,
            'is_mine'        => $this->assigned_to !== null && $this->assigned_to === $request->user()?->id,
            'created_by'     => $creator,
            'created_at'     => $this->created_at?->toDateString(),
        ];
    }
}
