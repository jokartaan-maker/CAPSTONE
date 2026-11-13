<?php

namespace App\Models;

use App\Enums\EvaluationStatus;
use App\Enums\EvaluationType;
use App\Enums\EvaluatorRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluation extends Model
{
    protected $fillable = [
        'team_id',
        'evaluator_id',
        'student_id',
        'evaluation_type',
        'evaluator_role',
        'status',
        'total_score',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'evaluation_type' => EvaluationType::class,
            'evaluator_role' => EvaluatorRole::class,
            'status' => EvaluationStatus::class,
            'total_score' => 'decimal:2',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(EvaluationScore::class);
    }
}
