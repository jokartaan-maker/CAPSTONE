<?php

namespace App\Models;

use App\Enums\RecommendationStatus;
use App\Enums\RecommendationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommitteeRecommendation extends Model
{
    protected $fillable = [
        'team_id',
        'author_id',
        'recommended_supervisor_id',
        'decided_by',
        'type',
        'payload',
        'reason',
        'status',
        'decided_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => RecommendationType::class,
            'status' => RecommendationStatus::class,
            'payload' => 'array',
            'decided_at' => 'datetime',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function recommendedSupervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recommended_supervisor_id');
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
