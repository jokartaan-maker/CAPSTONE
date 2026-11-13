<?php

namespace App\Models;

use App\Enums\DeadlineStatus;
use App\Enums\SubmissionType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Deadline extends Model
{
    protected $fillable = [
        'academic_term_id',
        'team_id',
        'created_by',
        'title',
        'description',
        'submission_type',
        'due_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'submission_type' => SubmissionType::class,
            'status' => DeadlineStatus::class,
            'due_at' => 'datetime',
        ];
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    /** موعد عام للفصل كله (حددته اللجنة) وليس لفريق محدد */
    public function isTermWide(): bool
    {
        return $this->team_id === null;
    }

    /** المواعيد التي تخص فريقًا: مواعيد الفريق نفسه + المواعيد العامة لفصله */
    public function scopeForTeam(Builder $query, Team $team): Builder
    {
        return $query->where('academic_term_id', $team->academic_term_id)
            ->where(fn (Builder $q) => $q->whereNull('team_id')->orWhere('team_id', $team->id));
    }
}
