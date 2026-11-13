<?php

namespace App\Enums;

trait HasValues
{
    /** @return array<int, string> قيم الـ enum لاستخدامها في الـ migrations والتحقق */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** قاعدة تحقق جاهزة: in:a,b,c */
    public static function rule(): string
    {
        return 'in:'.implode(',', self::values());
    }
}
