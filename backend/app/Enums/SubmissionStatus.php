<?php

namespace App\Enums;

enum SubmissionStatus: string
{
    use HasValues;

    case NotSubmitted = 'not_submitted';
    case Submitted = 'submitted';
    case Late = 'late';
    case NeedsChanges = 'needs_changes';
    case Reviewed = 'reviewed';

    public function label(): string
    {
        return match ($this) {
            self::NotSubmitted => 'لم يُسلَّم',
            self::Submitted => 'مُسلَّم',
            self::Late => 'مُسلَّم متأخرًا',
            self::NeedsChanges => 'يحتاج تعديلًا',
            self::Reviewed => 'تمت مراجعته',
        };
    }
}
