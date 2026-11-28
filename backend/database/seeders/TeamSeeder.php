<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use App\Models\Idea;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Database\Seeder;

// طلاب تجريبيون + فريقان في الفصل الحالي
// محمد طعان (طالب الاختبار) يبقى بلا فريق ليجرب إنشاء فريق
class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $term = AcademicTerm::where('is_current', true)->firstOrFail();

        // 1) طلاب تجريبيون (كلمة المرور: Student@2026)
        $students = collect([
            ['email' => 'ahmad@aspu.edu.sy',  'name' => 'أحمد الخطيب', 'university_number' => '0220411101', 'major' => 'هندسة البرمجيات'],
            ['email' => 'lina@aspu.edu.sy',   'name' => 'لينا حداد',   'university_number' => '0220411102', 'major' => 'هندسة البرمجيات'],
            ['email' => 'omar@aspu.edu.sy',   'name' => 'عمر سليمان',  'university_number' => '0220411103', 'major' => 'هندسة البرمجيات'],
            ['email' => 'rama@aspu.edu.sy',   'name' => 'راما النجار', 'university_number' => '0220411104', 'major' => 'هندسة البرمجيات'],
            ['email' => 'yazan@aspu.edu.sy',  'name' => 'يزن العلي',   'university_number' => '0220411105', 'major' => 'الذكاء الاصطناعي'],
            ['email' => 'hala@aspu.edu.sy',   'name' => 'هلا منصور',   'university_number' => '0220411106', 'major' => 'الذكاء الاصطناعي'],
            ['email' => 'karam@aspu.edu.sy',  'name' => 'كرم يوسف',    'university_number' => '0220411107', 'major' => 'الذكاء الاصطناعي'],
        ])->mapWithKeys(fn ($data) => [
            $data['email'] => Student::updateOrCreate(
                ['email' => $data['email']],
                $data + ['password' => 'Student@2026', 'study_year' => 5, 'skills' => ['Frontend']],
            ),
        ]);

        // 2) الفرق: [الفكرة، اسم الفريق، الأعضاء (الأول هو القائد)]
        $teams = [
            ['IDEA-001', 'فريق المبرمجين', ['ahmad@aspu.edu.sy', 'lina@aspu.edu.sy', 'omar@aspu.edu.sy', 'rama@aspu.edu.sy']], // ممتلئ 4/4
            ['IDEA-002', 'فريق الذكاء',    ['yazan@aspu.edu.sy', 'hala@aspu.edu.sy']],                                          // مفتوح 2/4
        ];

        foreach ($teams as [$code, $name, $emails]) {
            $idea = Idea::where('code', $code)->firstOrFail();

            $team = Team::updateOrCreate(
                ['idea_id' => $idea->id],
                [
                    'name'             => $name,
                    'supervisor_id'    => $idea->supervisor_id,
                    'academic_term_id' => $term->id,
                    'capacity'         => config('students.team_capacity'),
                    'status'           => 'forming',
                ],
            );

            foreach ($emails as $index => $email) {
                TeamMember::updateOrCreate(
                    ['student_id' => $students[$email]->id, 'academic_term_id' => $term->id],
                    [
                        'team_id'   => $team->id,
                        'role'      => $index === 0 ? 'leader' : 'member',
                        'joined_at' => now()->subDays(10 - $index),
                    ],
                );
            }
        }
    }
}
