<?php

namespace App\Enums;

enum SimilarityCheckType: string
{
    use HasValues;

    case Precheck = 'precheck';
    case Review = 'review';

    public function label(): string
    {
        return match ($this) {
            self::Precheck => 'فحص مسبق',
            self::Review => 'فحص عند المراجعة',
        };
    }
}
