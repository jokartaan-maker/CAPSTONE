<?php

namespace App\Enums;

enum FeedbackStatus: string
{
    use HasValues;

    case Open = 'open';
    case InProgress = 'in_progress';
    case Addressed = 'addressed';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'مفتوحة',
            self::InProgress => 'قيد المعالجة',
            self::Addressed => 'تمت المعالجة',
            self::Closed => 'مغلقة',
        };
    }
}
