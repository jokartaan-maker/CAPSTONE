<?php

namespace App\Enums;

enum TeamRole: string
{
    use HasValues;

    case Leader = 'leader';
    case Member = 'member';

    public function label(): string
    {
        return match ($this) {
            self::Leader => 'قائد الفريق',
            self::Member => 'عضو',
        };
    }
}
