<?php

namespace App\Enums;

enum EvaluationType: string
{
    use HasValues;

    case Team = 'team';
    case Individual = 'individual';

    public function label(): string
    {
        return match ($this) {
            self::Team => 'تقييم جماعي',
            self::Individual => 'تقييم فردي',
        };
    }
}
