<?php

namespace App\Enums;

enum SimilarityDecision: string
{
    use HasValues;

    case ActualDuplicate = 'actual_duplicate';
    case Extension = 'extension';
    case PermittedSimilarity = 'permitted_similarity';

    public function label(): string
    {
        return match ($this) {
            self::ActualDuplicate => 'تكرار فعلي',
            self::Extension => 'امتداد',
            self::PermittedSimilarity => 'تشابه مسموح',
        };
    }
}
