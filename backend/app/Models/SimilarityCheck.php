<?php

namespace App\Models;

use App\Enums\SimilarityBand;
use App\Enums\SimilarityCheckType;
use App\Enums\SimilarityDecision;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SimilarityCheck extends Model
{
    protected $fillable = [
        'idea_id',
        'matched_idea_id',
        'decided_by',
        'check_type',
        'rank',
        'similarity',
        'lexical_score',
        'flagged',
        'limited_check',
        'band',
        'breakdown',
        'shared_elements',
        'decision',
        'decision_reason',
        'decided_at',
    ];

    protected function casts(): array
    {
        return [
            'check_type' => SimilarityCheckType::class,
            'band' => SimilarityBand::class,
            'decision' => SimilarityDecision::class,
            'flagged' => 'boolean',
            'limited_check' => 'boolean',
            'breakdown' => 'array',
            'shared_elements' => 'array',
            'similarity' => 'decimal:4',
            'lexical_score' => 'decimal:4',
            'decided_at' => 'datetime',
        ];
    }

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function matchedIdea(): BelongsTo
    {
        return $this->belongsTo(Idea::class, 'matched_idea_id');
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
