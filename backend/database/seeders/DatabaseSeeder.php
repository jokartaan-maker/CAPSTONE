<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            StudentSeeder::class,
            AcademicTermSeeder::class,   // قبل الأفكار: كل فكرة تحتاج فصلاً
            SupervisorSeeder::class,     // قبل الأفكار: كل فكرة معتمدة لها مشرف
            IdeaSeeder::class,
            TeamSeeder::class,           // بعد الأفكار: كل فريق على فكرة
            JoinRequestSeeder::class,    // بعد الفرق: طلبات ودعوات تجريبية
            TaskSeeder::class,           // بعد الفرق: مهام تجريبية
        ]);
    }
}
