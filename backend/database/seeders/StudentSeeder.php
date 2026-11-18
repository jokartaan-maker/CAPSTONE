<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        Student::updateOrCreate(
            ['email' => 'sara@aspu.edu.sy'],
            [
                'name' => 'محمد طعان',
                'password' => 'mohamad@2026',
                'university_number' => '0220411074',
                'major' => 'هندسة البرمجيات',
                'study_year' => 5,
                'skills' => ['Backend', 'Python', 'تصميم واجهات'],
            ],
        );
    }
}
