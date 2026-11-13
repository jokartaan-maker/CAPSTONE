<?php

namespace App\Enums;

enum CommitteeRole: string
{
    use HasValues;

    case Chair = 'chair';
    case Member = 'member';
    case Supervisor = 'supervisor';

    public function label(): string
    {
        return match ($this) {
            self::Chair => 'رئيس اللجنة',
            self::Member => 'عضو',
            self::Supervisor => 'المشرف',
        };
    }
}
