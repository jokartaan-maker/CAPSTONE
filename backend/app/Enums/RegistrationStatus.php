<?php

namespace App\Enums;

enum RegistrationStatus: string
{
    use HasValues;

    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'بانتظار الموافقة',
            self::Approved => 'مقبول',
            self::Rejected => 'مرفوض',
        };
    }
}
