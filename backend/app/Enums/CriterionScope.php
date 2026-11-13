<?php

namespace App\Enums;

enum CriterionScope: string
{
    use HasValues;

    case Team = 'team';
    case Member = 'member';

    public function label(): string
    {
        return match ($this) {
            self::Team => 'للفريق',
            self::Member => 'للعضو',
        };
    }
}
