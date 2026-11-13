<?php

namespace App\Support;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;

/**
 * قراءة إعدادات المنصة: القيمة في جدول system_settings أولًا، وإلا القيمة الافتراضية من config/capstone.php
 * مثال: Settings::get('teams.max_members')
 */
class Settings
{
    public static function get(string $key, mixed $default = null): mixed
    {
        $all = Cache::rememberForever('capstone.settings', fn () => SystemSetting::pluck('value', 'name')->all());

        return array_key_exists($key, $all) ? $all[$key] : config("capstone.$key", $default);
    }

    public static function set(string $key, mixed $value, ?int $userId = null): void
    {
        SystemSetting::updateOrCreate(
            ['name' => $key],
            ['group' => explode('.', $key)[0], 'value' => $value, 'updated_by' => $userId]
        );

        Cache::forget('capstone.settings');
    }
}
