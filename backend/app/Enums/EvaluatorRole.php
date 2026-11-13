<?php

namespace App\Enums;

enum EvaluatorRole: string
{
    use HasValues;

    case Supervisor = 'supervisor';
    case Committee = 'committee';

    public function label(): string
    {
        return match ($this) {
            self::Supervisor => 'مشرف',
            self::Committee => 'لجنة علمية',
        };
    }
}
