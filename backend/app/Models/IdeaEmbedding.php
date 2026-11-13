<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IdeaEmbedding extends Model
{
    const CREATED_AT = null;

    protected $fillable = [
        'idea_id',
        'model_name',
        'embedding',
        'normalized_text',
        'title_tfidf',
        'problem_tfidf',
        'features_set',
        'target_users_set',
        'domain_normalized',
        'tech_set',
        'keywords_set',
        'text_hash',
    ];

    protected function casts(): array
    {
        return [
            'embedding' => 'array',
            'title_tfidf' => 'array',
            'problem_tfidf' => 'array',
            'features_set' => 'array',
            'target_users_set' => 'array',
            'tech_set' => 'array',
            'keywords_set' => 'array',
        ];
    }

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }
}
