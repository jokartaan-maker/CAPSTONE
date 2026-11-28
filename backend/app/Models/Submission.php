<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    protected $fillable = [
        'deadline_id',
        'team_id',
        'uploaded_by',
        'version',
        'file_path',
        'original_name',
        'mime_type',
        'size',
        'notes',
        'is_late',
        'submitted_at',
        'grade',
        'feedback',
        'graded_by',
        'graded_at',
    ];

    protected function casts(): array
    {
        return [
            'version'      => 'integer',
            'size'         => 'integer',
            'is_late'      => 'boolean',
            'submitted_at' => 'datetime',
            'grade'        => 'float',
            'graded_at'    => 'datetime',
        ];
    }

    public function deadline(): BelongsTo
    {
        return $this->belongsTo(Deadline::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'uploaded_by');
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class, 'graded_by');
    }

    public function isGraded(): bool
    {
        return $this->graded_at !== null;
    }

    // الحجم بصيغة مقروءة: 1.5 MB
    public function readableSize(): string
    {
        $kb = $this->size / 1024;

        return $kb >= 1024 ? round($kb / 1024, 1) . ' MB' : max(1, round($kb)) . ' KB';
    }
}
