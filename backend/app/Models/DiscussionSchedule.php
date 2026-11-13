<?php

namespace App\Models;

use App\Enums\DiscussionStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiscussionSchedule extends Model
{
    protected $fillable = [
        'team_id',
        'created_by',
        'approved_by',
        'starts_at',
        'ends_at',
        'room',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => DiscussionStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function committee(): HasMany
    {
        return $this->hasMany(DiscussionCommittee::class);
    }

    public function committeeMembers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'discussion_committee', 'discussion_schedule_id', 'user_id');
    }

    /** الجلسات المتداخلة زمنيًا مع فترة معينة (أساس فحص التعارض UC-35) */
    public function scopeOverlapping(Builder $query, $startsAt, $endsAt): Builder
    {
        return $query->where('status', '!=', DiscussionStatus::Cancelled)
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt);
    }
}
