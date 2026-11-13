<?php

namespace App\Models;

use App\Enums\CommitteeRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiscussionCommittee extends Model
{
    protected $table = 'discussion_committee';

    const UPDATED_AT = null;

    protected $fillable = [
        'discussion_schedule_id',
        'user_id',
        'role_in_committee',
    ];

    protected function casts(): array
    {
        return [
            'role_in_committee' => CommitteeRole::class,
        ];
    }

    public function discussion(): BelongsTo
    {
        return $this->belongsTo(DiscussionSchedule::class, 'discussion_schedule_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
