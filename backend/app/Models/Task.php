<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    public const STATUSES   = ['todo', 'in_progress', 'done'];
    public const PRIORITIES = ['low', 'medium', 'high'];

    protected $fillable = [
        'team_id',
        'title',
        'description',
        'assigned_to',
        'priority',
        'status',
        'due_date',
        'completed_at',
        'created_by_student_id',
        'created_by_supervisor_id',
    ];

    protected function casts(): array
    {
        return [
            'due_date'     => 'date',
            'completed_at' => 'datetime',
        ];
    }

    // ---------- العلاقات ----------

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    // العضو المسؤول عن المهمة
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'assigned_to');
    }

    public function creatorStudent(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'created_by_student_id');
    }

    public function creatorSupervisor(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class, 'created_by_supervisor_id');
    }

    // ---------- دوال مساعدة ----------

    // متأخرة: لها موعد مضى ولم تُنجز
    public function isOverdue(): bool
    {
        return $this->due_date !== null
            && $this->status !== 'done'
            && $this->due_date->lt(today());
    }

    // تغيير الحالة مع ضبط وقت الإنجاز
    public function setStatus(string $status): void
    {
        $this->update([
            'status'       => $status,
            'completed_at' => $status === 'done' ? now() : null,
        ]);
    }

    public function statusLabel(): string
    {
        return ['todo' => 'للتنفيذ', 'in_progress' => 'قيد التنفيذ', 'done' => 'منجزة'][$this->status] ?? $this->status;
    }

    public function priorityLabel(): string
    {
        return ['low' => 'منخفضة', 'medium' => 'متوسطة', 'high' => 'عالية'][$this->priority] ?? $this->priority;
    }
}
