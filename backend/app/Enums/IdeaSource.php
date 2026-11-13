<?php

namespace App\Enums;

enum IdeaSource: string
{
    use HasValues;

    case Supervisor = 'supervisor';
    case Student = 'student';
    case Import = 'import';

    public function label(): string
    {
        return match ($this) {
            self::Supervisor => 'مشرف',
            self::Student => 'طالب',
            self::Import => 'مستورد من الأرشيف',
        };
    }
}
