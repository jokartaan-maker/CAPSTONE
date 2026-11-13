<?php

namespace App\Models;

use App\Enums\FeedbackResponseStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackResponse extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'feedback_id',
        'revised_version_id',
        'responder_id',
        'response',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => FeedbackResponseStatus::class,
        ];
    }

    public function feedback(): BelongsTo
    {
        return $this->belongsTo(Feedback::class);
    }

    public function revisedVersion(): BelongsTo
    {
        return $this->belongsTo(SubmissionVersion::class, 'revised_version_id');
    }

    public function responder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responder_id');
    }
}
