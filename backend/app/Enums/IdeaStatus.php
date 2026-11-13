<?php

namespace App\Enums;

enum IdeaStatus: string
{
    use HasValues;

    case Draft = 'draft';
    case PendingReview = 'pending_review';
    case NeedsModification = 'needs_modification';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Withdrawn = 'withdrawn';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'مسودة',
            self::PendingReview => 'بانتظار مراجعة اللجنة',
            self::NeedsModification => 'تحتاج تعديلًا',
            self::Approved => 'معتمدة',
            self::Rejected => 'مرفوضة',
            self::Withdrawn => 'مسحوبة',
            self::Archived => 'مؤرشفة',
        };
    }
}
