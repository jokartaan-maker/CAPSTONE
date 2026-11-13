<?php

namespace App\Enums;

enum RecommendationStatus: string
{
    use HasValues;

    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'معلّقة',
            self::Accepted => 'مقبولة',
            self::Rejected => 'مرفوضة',
        };
    }
}
