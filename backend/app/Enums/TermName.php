<?php

namespace App\Enums;

enum TermName: string
{
    use HasValues;

    case First = 'first';
    case Second = 'second';
    case Summer = 'summer';

    public function label(): string
    {
        return match ($this) {
            self::First => 'الفصل الأول',
            self::Second => 'الفصل الثاني',
            self::Summer => 'الفصل الصيفي',
        };
    }
}
