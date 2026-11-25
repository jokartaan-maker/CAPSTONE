<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use App\Models\JoinRequest;
use App\Models\Student;
use App\Models\Team;
use Illuminate\Database\Seeder;

// طلب ودعوة تجريبيان على "فريق الذكاء" (2/4):
// - كرم طلب الانضمام ← يرد يزن (القائد)
// - يزن دعا محمد طعان ← يرد محمد
class JoinRequestSeeder extends Seeder
{
    public function run(): void
    {
        $term = AcademicTerm::where('is_current', true)->firstOrFail();
        $team = Team::where('name', 'فريق الذكاء')->firstOrFail();

        $items = [
            ['karam@aspu.edu.sy',   'request',    'مرحباً، لدي خبرة في Python وتعلم الآلة وأرغب بالانضمام لفريقكم'],
            ['mohamad@aspu.edu.sy', 'invitation', 'نحتاج مطور Backend في فريقنا، هل تنضم إلينا؟'],
        ];

        foreach ($items as [$email, $type, $message]) {
            JoinRequest::updateOrCreate(
                [
                    'team_id'    => $team->id,
                    'student_id' => Student::where('email', $email)->firstOrFail()->id,
                    'type'       => $type,
                ],
                [
                    'academic_term_id' => $term->id,
                    'status'           => 'pending',
                    'message'          => $message,
                    'responded_at'     => null,
                ],
            );
        }
    }
}
