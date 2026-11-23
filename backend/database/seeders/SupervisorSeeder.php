<?php

namespace Database\Seeders;

use App\Models\Supervisor;
use Illuminate\Database\Seeder;

class SupervisorSeeder extends Seeder
{
    public function run(): void
    {
        $supervisors = [
            [
                'email'          => 'k.ismail@aspu.edu.sy',
                'name'           => 'د. خالد إسماعيل',
                'academic_title' => 'associate_professor',
                'department'     => 'هندسة البرمجيات',
                'specialization' => 'هندسة البرمجيات ونظم المعلومات',
                'max_teams'      => 4,
            ],
            [
                'email'          => 's.alhassan@aspu.edu.sy',
                'name'           => 'د. سارة الحسن',
                'academic_title' => 'assistant_professor',
                'department'     => 'الذكاء الاصطناعي',
                'specialization' => 'تعلم الآلة ومعالجة اللغات الطبيعية',
                'max_teams'      => 3,
            ],
            [
                'email'          => 'm.daher@aspu.edu.sy',
                'name'           => 'م. مازن ضاهر',
                'academic_title' => 'lecturer',
                'department'     => 'الشبكات وأمن المعلومات',
                'specialization' => 'أمن الشبكات والحوسبة السحابية',
                'max_teams'      => 2,
            ],
        ];

        foreach ($supervisors as $data) {
            Supervisor::updateOrCreate(
                ['email' => $data['email']],
                $data + [
                    'password'            => 'Supervisor@2026',
                    'registration_status' => 'approved',
                    'is_active'           => true,
                ],
            );
        }
    }
}
