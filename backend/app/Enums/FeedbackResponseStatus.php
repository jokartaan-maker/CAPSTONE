<?php

namespace App\Enums;

enum FeedbackResponseStatus: string
{
    use HasValues;

    case Submitted = 'submitted';
    case Seen = 'seen';

    public function label(): string
    {
        return match ($this) {
            self::Submitted => 'مُرسل',
            self::Seen => 'اطّلع عليه المشرف',
        };
    }
}
