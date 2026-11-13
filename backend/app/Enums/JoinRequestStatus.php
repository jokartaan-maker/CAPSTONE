<?php

namespace App\Enums;

enum JoinRequestStatus: string
{
    use HasValues;

    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'معلّق',
            self::Accepted => 'مقبول',
            self::Rejected => 'مرفوض',
            self::Cancelled => 'ملغى',
        };
    }
}
