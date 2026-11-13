<?php

namespace App\Models;

use App\Enums\TermName;
use App\Enums\TermStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicTerm extends Model
{
    protected $fillable = [
        'academic_year',
        'term_name',
        'starts_at',
        'ends_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'term_name' => TermName::class,
            'status' => TermStatus::class,
            'starts_at' => 'date',
            'ends_at' => 'date',
        ];
    }

    public function ideas(): HasMany
    {
        return $this->hasMany(Idea::class);
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    public function deadlines(): HasMany
    {
        return $this->hasMany(Deadline::class);
    }

    public function evaluationCriteria(): HasMany
    {
        return $this->hasMany(EvaluationCriterion::class);
    }

    /** الفصل الفعّال حاليًا */
    public static function current(): ?self
    {
        return static::where('status', TermStatus::Active)->latest('starts_at')->first();
    }
}
