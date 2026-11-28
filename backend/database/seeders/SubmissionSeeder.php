<?php

namespace Database\Seeders;

use App\Models\Deadline;
use App\Models\Student;
use App\Models\Submission;
use App\Models\Team;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

// تسليمات تجريبية لـ "فريق المبرمجين":
// - مقترح المشروع: إصداران، الثاني مُقيَّم من المشرف
// - تحليل النظام: إصدار واحد متأخر
class SubmissionSeeder extends Seeder
{
    public function run(): void
    {
        $team  = Team::where('name', 'فريق المبرمجين')->firstOrFail();
        $ahmad = Student::where('email', 'ahmad@aspu.edu.sy')->value('id');
        $lina  = Student::where('email', 'lina@aspu.edu.sy')->value('id');

        $proposal = Deadline::where('title', 'مقترح المشروع')->firstOrFail();
        $analysis = Deadline::where('title', 'تحليل النظام')->firstOrFail();

        $items = [
            // [الموعد، الإصدار، الرافع، اسم الملف، قبل الموعد بكم يوم (سالب = بعده)، مُقيَّم؟]
            [$proposal, 1, $ahmad, 'مقترح_المشروع.pdf',         3,  false],
            [$proposal, 2, $lina,  'مقترح_المشروع_معدل.pdf',    1,  true],
            [$analysis, 1, $lina,  'تحليل_النظام_SRS.pdf',      -1, false],
        ];

        foreach ($items as [$deadline, $version, $uploader, $fileName, $daysBefore, $graded]) {
            $path = "submissions/team_{$team->id}/deadline_{$deadline->id}/v{$version}_seed.pdf";
            Storage::disk('local')->put($path, "%PDF-1.4\n% ملف تجريبي: {$fileName}\n");

            $submittedAt = $deadline->due_at->copy()->subDays($daysBefore);

            Submission::updateOrCreate(
                ['deadline_id' => $deadline->id, 'team_id' => $team->id, 'version' => $version],
                [
                    'uploaded_by'   => $uploader,
                    'file_path'     => $path,
                    'original_name' => $fileName,
                    'mime_type'     => 'application/pdf',
                    'size'          => Storage::disk('local')->size($path),
                    'notes'         => $version === 2 ? 'تم تعديل النطاق حسب ملاحظات المشرف' : null,
                    'is_late'       => $daysBefore < 0,
                    'submitted_at'  => $submittedAt,
                    'grade'         => $graded ? 9 : null,
                    'feedback'      => $graded ? 'مقترح واضح ونطاق مناسب، أضيفوا خطة زمنية مفصلة' : null,
                    'graded_by'     => $graded ? $team->supervisor_id : null,
                    'graded_at'     => $graded ? $submittedAt->copy()->addDays(2) : null,
                ],
            );
        }
    }
}
