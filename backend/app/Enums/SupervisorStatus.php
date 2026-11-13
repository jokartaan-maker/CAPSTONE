<?php

namespace App\Enums;

enum SupervisorStatus: string
{
    use HasValues;

    case Pending = 'pending';
    case Accepted = 'accepted';
    case Declined = 'declined';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'بانتظار موافقة المشرف',
            self::Accepted => 'وافق المشرف',
            self::Declined => 'اعتذر المشرف',
        };
    }
}
