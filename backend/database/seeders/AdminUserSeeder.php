<?php

namespace Database\Seeders;

use App\Enums\RegistrationStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

/** حساب مدير النظام مُنشأ مسبقًا ولا يمر بالتسجيل (FR-44) */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@capstone.test')],
            [
                'name' => 'مدير النظام',
                'password' => env('ADMIN_PASSWORD', 'ChangeMe#2026'),
                'is_active' => true,
                'registration_status' => RegistrationStatus::Approved,
            ]
        );

        $admin->roles()->syncWithoutDetaching([Role::where('name', 'admin')->firstOrFail()->id]);
    }
}
