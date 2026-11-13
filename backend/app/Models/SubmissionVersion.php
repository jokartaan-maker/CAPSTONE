<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubmissionVersion extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'submission_id',
        'uploaded_by',
        'version_no',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'change_note',
        'is_late',
        'uploaded_at',
    ];

    protected function casts(): array
    {
        return [
            'is_late' => 'boolean',
            'uploaded_at' => 'datetime',
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class, 'submission_version_id');
    }
}
