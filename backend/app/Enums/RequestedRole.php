<?php

namespace App\Enums;

enum RequestedRole: string
{
    use HasValues;

    case Student = 'student';
    case Supervisor = 'supervisor';
    case Committee = 'committee';

    public function label(): string
    {
        return match ($this) {
            self::Student => 'طالب',
            self::Supervisor => 'مشرف',
            self::Committee => 'لجنة علمية',
        };
    }
}
