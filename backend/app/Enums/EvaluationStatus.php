<?php

namespace App\Enums;

enum EvaluationStatus: string
{
    use HasValues;

    case Draft = 'draft';
    case Final = 'final';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'مسودة',
            self::Final => 'نهائي',
        };
    }
}
