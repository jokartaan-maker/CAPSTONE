<?php

namespace App\Enums;

enum SubmissionType: string
{
    use HasValues;

    case Proposal = 'proposal';
    case ProgressReport = 'progress_report';
    case FinalReport = 'final_report';
    case Presentation = 'presentation';
    case SourceCode = 'source_code';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Proposal => 'مقترح المشروع',
            self::ProgressReport => 'تقرير مرحلي',
            self::FinalReport => 'التقرير النهائي',
            self::Presentation => 'العرض التقديمي',
            self::SourceCode => 'الشيفرة المصدرية',
            self::Other => 'أخرى',
        };
    }
}
