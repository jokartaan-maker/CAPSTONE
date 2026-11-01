<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@capstone.test'],
            [
                'name' => 'مدير النظام',
                'password' => 'ChangeMe#2026',
                'is_active' => true,
            ]
        );

        $admin->roles()->syncWithoutDetaching([
            Role::where('name', 'admin')->firstOrFail()->id,
        ]);
    }
}