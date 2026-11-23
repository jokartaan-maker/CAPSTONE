<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicTerm extends Model
{
    protected $fillable = [
        'name',
        'academic_year',
        'semester',
        'start_date',
        'end_date',
        'is_current',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
            'is_current' => 'boolean',
        ];
    }

    // الفصل الدراسي الفعّال الآن (أو null إذا لم يُحدَّد)
    public static function current(): ?self
    {
        return static::where('is_current', true)->first();
    }

    public function ideas(): HasMany
    {
        return $this->hasMany(Idea::class);
    }
}
