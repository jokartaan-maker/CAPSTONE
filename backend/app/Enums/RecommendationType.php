<?php

namespace App\Enums;

enum RecommendationType: string
{
    use HasValues;

    case SupervisorAssignment = 'supervisor_assignment';
    case General = 'general';

    public function label(): string
    {
        return match ($this) {
            self::SupervisorAssignment => 'تعيين مشرف',
            self::General => 'توصية عامة',
        };
    }
}
