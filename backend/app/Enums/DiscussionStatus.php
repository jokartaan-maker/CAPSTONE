<?php

namespace App\Enums;

enum DiscussionStatus: string
{
    use HasValues;

    case Proposed = 'proposed';
    case Scheduled = 'scheduled';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Proposed => 'مقترح من المشرف',
            self::Scheduled => 'مجدول',
            self::Completed => 'منتهٍ',
            self::Cancelled => 'ملغى',
        };
    }
}
