<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ImportBatch extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'academic_term_id',
        'imported_by',
        'file_name',
        'total_rows',
        'success_rows',
        'skipped_rows',
        'failed_rows',
        'errors',
    ];

    protected function casts(): array
    {
        return [
            'errors' => 'array',
        ];
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    public function importer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    public function ideas(): HasMany
    {
        return $this->hasMany(Idea::class);
    }
}
