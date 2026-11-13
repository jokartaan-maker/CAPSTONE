<?php

namespace App\Enums;

enum TermStatus: string
{
    use HasValues;

    case Upcoming = 'upcoming';
    case Active = 'active';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Upcoming => 'قادم',
            self::Active => 'فعّال',
            self::Closed => 'مغلق',
        };
    }
}
