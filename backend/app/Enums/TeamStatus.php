<?php

namespace App\Enums;

enum TeamStatus: string
{
    use HasValues;

    case Forming = 'forming';
    case Active = 'active';
    case Completed = 'completed';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Forming => 'قيد التكوين',
            self::Active => 'فعّال',
            self::Completed => 'مكتمل',
            self::Archived => 'مؤرشف',
        };
    }
}
