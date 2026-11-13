<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectArchive extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'team_id',
        'archived_by',
        'project_snapshot',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'project_snapshot' => 'array',
            'archived_at' => 'datetime',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function archiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archived_by');
    }
}
