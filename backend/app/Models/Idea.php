<?php

namespace App\Models;

use App\Enums\IdeaSource;
use App\Enums\IdeaStatus;
use App\Enums\SupervisorStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Idea extends Model
{
    protected $fillable = [
        'related_idea_id',
        'proposed_by',
        'supervisor_id',
        'reviewed_by',
        'import_batch_id',
        'academic_term_id',
        'supervisor_name',
        'supervisor_status',
        'title',
        'description',
        'problem',
        'solution',
        'target_users',
        'features',
        'requirements',
        'tech_stack',
        'keywords',
        'domain',
        'source',
        'status',
        'difference_note',
        'extension_note',
        'review_note',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'source' => IdeaSource::class,
            'status' => IdeaStatus::class,
            'supervisor_status' => SupervisorStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function originalIdea(): BelongsTo
    {
        return $this->belongsTo(Idea::class, 'related_idea_id');
    }

    public function extensions(): HasMany
    {
        return $this->hasMany(Idea::class, 'related_idea_id');
    }

    public function proposer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proposed_by');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function importBatch(): BelongsTo
    {
        return $this->belongsTo(ImportBatch::class);
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    public function embedding(): HasOne
    {
        return $this->hasOne(IdeaEmbedding::class);
    }

    public function similarityChecks(): HasMany
    {
        return $this->hasMany(SimilarityCheck::class);
    }

    public function team(): HasOne
    {
        return $this->hasOne(Team::class);
    }
}
