<?php

namespace App\Models;

use App\Enums\CriterionScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationCriterion extends Model
{
    protected $table = 'evaluation_criteria';

    protected $fillable = [
        'academic_term_id',
        'name',
        'description',
        'weight',
        'max_score',
        'scope',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'scope' => CriterionScope::class,
            'is_active' => 'boolean',
            'weight' => 'decimal:2',
            'max_score' => 'decimal:2',
        ];
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(EvaluationScore::class, 'criterion_id');
    }
}
