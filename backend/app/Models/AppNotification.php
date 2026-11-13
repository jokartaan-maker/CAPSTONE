<?php

namespace App\Models;

use App\Enums\NotificationChannel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppNotification extends Model
{
    // اسم الصنف AppNotification وليس Notification حتى لا يتعارض مع إشعارات Laravel المدمجة
    protected $table = 'notifications';

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'channel',
        'entity_type',
        'entity_id',
        'read_at',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'channel' => NotificationChannel::class,
            'read_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
