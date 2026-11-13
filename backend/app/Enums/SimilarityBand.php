<?php

namespace App\Enums;

enum SimilarityBand: string
{
    use HasValues;

    case Clear = 'clear';
    case NeedsReview = 'needs_review';

    public function label(): string
    {
        return match ($this) {
            self::Clear => 'لا تشابه ملحوظ',
            self::NeedsReview => 'تحتاج مراجعة تشابه',
        };
    }
}
