<?php

namespace App\Models;

use App\Enums\TeamStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Team extends Model
{
    protected $fillable = [
        'academic_term_id',
        'idea_id',
        'supervisor_id',
        'name',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => TeamStatus::class,
        ];
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_members', 'team_id', 'student_id');
    }

    public function joinRequests(): HasMany
    {
        return $this->hasMany(JoinRequest::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function deadlines(): HasMany
    {
        return $this->hasMany(Deadline::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    public function discussion(): HasOne
    {
        return $this->hasOne(DiscussionSchedule::class);
    }

    public function archive(): HasOne
    {
        return $this->hasOne(ProjectArchive::class);
    }

    public function hasMember(int $userId): bool
    {
        return $this->members()->where('student_id', $userId)->exists();
    }
}
