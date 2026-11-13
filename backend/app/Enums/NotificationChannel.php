<?php

namespace App\Enums;

enum NotificationChannel: string
{
    use HasValues;

    case InApp = 'in_app';
    case Email = 'email';
    case Both = 'both';

    public function label(): string
    {
        return match ($this) {
            self::InApp => 'داخل النظام',
            self::Email => 'بريد إلكتروني',
            self::Both => 'داخل النظام وبريد إلكتروني',
        };
    }
}
