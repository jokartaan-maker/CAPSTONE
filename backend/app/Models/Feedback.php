<?php

namespace App\Models;

use App\Enums\FeedbackStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Feedback extends Model
{
    protected $table = 'feedback';

    protected $fillable = [
        'submission_version_id',
        'author_id',
        'comment',
        'file_anchor',
        'status',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => FeedbackStatus::class,
            'file_anchor' => 'array',
            'resolved_at' => 'datetime',
        ];
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(SubmissionVersion::class, 'submission_version_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(FeedbackResponse::class);
    }
}
