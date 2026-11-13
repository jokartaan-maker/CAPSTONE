<?php

namespace App\Enums;

enum TaskStatus: string
{
    use HasValues;

    case New = 'new';
    case InProgress = 'in_progress';
    case ForReview = 'for_review';
    case Completed = 'completed';
    case Overdue = 'overdue';

    public function label(): string
    {
        return match ($this) {
            self::New => 'جديدة',
            self::InProgress => 'قيد التنفيذ',
            self::ForReview => 'للمراجعة',
            self::Completed => 'مكتملة',
            self::Overdue => 'متأخرة',
        };
    }
}
