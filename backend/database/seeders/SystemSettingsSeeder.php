<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

/** ينسخ القيم الافتراضية من config/capstone.php إلى system_settings دون الكتابة فوق ما عُدّل سابقًا */
class SystemSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = Arr::except(Arr::dot(config('capstone')), ['similarity.service_url']);

        // القوائم (مثل allowed_extensions) تُحفظ كقيمة واحدة لا كعناصر منفصلة
        foreach (config('capstone') as $group => $values) {
            foreach ($values as $key => $value) {
                if (is_array($value)) {
                    $defaults = Arr::where($defaults, fn ($v, $k) => ! str_starts_with($k, "$group.$key."));
                    $defaults["$group.$key"] = $value;
                }
            }
        }

        foreach ($defaults as $name => $value) {
            SystemSetting::firstOrCreate(
                ['name' => $name],
                ['group' => explode('.', $name)[0], 'value' => $value, 'updated_at' => now()]
            );
        }

        Cache::forget('capstone.settings');
    }
}
