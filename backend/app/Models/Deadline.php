<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Deadline extends Model
{
    protected $fillable = [
        'academic_term_id',
        'title',
        'description',
        'due_at',
        'allow_late',
        'max_score',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'due_at'     => 'datetime',
            'allow_late' => 'boolean',
            'max_score'  => 'integer',
        ];
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function scopeInCurrentTerm(Builder $query): Builder
    {
        return $query->whereHas('academicTerm', fn (Builder $q) => $q->where('is_current', true));
    }

    // انتهى الموعد؟
    public function isPast(): bool
    {
        return $this->due_at->isPast();
    }

    // هل يُقبل رفع تسليم الآن؟ (قبل الموعد، أو بعده إذا سُمح بالتأخير)
    public function acceptsSubmissions(): bool
    {
        return ! $this->isPast() || $this->allow_late;
    }
}
