<?php

namespace App\Enums;

enum DeadlineStatus: string
{
    use HasValues;

    case Open = 'open';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'مفتوح',
            self::Closed => 'مغلق',
        };
    }
}
