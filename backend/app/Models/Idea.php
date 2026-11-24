<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Idea extends Model
{
    protected $fillable = [
        'code',
        'title',
        'field',
        'description',
        'problem',
        'features',
        'requirements',
        'tech_stack',
        'tags',
        'status',
        'academic_term_id',
        'supervisor_id',
        'proposed_by_student_id',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'features'     => 'array',
            'requirements' => 'array',
            'tech_stack'   => 'array',
            'tags'         => 'array',
            'approved_at'  => 'datetime',
        ];
    }

    // ---------- العلاقات ----------

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class);
    }

    // الطالب الذي اقترح الفكرة
    public function proposedBy(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'proposed_by_student_id');
    }

    // ---------- Scopes (شروط جاهزة للاستعلام) ----------

    // Idea::approved() → الأفكار المعتمدة فقط
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    // Idea::inCurrentTerm() → أفكار الفصل الحالي فقط
    public function scopeInCurrentTerm(Builder $query): Builder
    {
        return $query->whereHas('academicTerm', fn (Builder $q) => $q->where('is_current', true));
    }
}
