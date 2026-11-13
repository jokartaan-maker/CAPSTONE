<?php

namespace App\Models;

use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskUpdate extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'task_id',
        'user_id',
        'old_status',
        'new_status',
        'note',
        'attachment_path',
    ];

    protected function casts(): array
    {
        return [
            'old_status' => TaskStatus::class,
            'new_status' => TaskStatus::class,
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
