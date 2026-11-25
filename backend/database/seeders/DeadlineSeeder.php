<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use App\Models\Deadline;
use Illuminate\Database\Seeder;

// مراحل مشروع التخرج في الفصل الحالي (لاحقاً تنشئها اللجنة/الإدارة)
class DeadlineSeeder extends Seeder
{
    public function run(): void
    {
        $term = AcademicTerm::where('is_current', true)->firstOrFail();

        $deadlines = [
            // [العنوان، الوصف، بعد كم يوم، يقبل التأخير، العلامة]
            ['مقترح المشروع',   'وثيقة تعريف المشروع: المشكلة والأهداف والنطاق',           -20, true,  10],
            ['تحليل النظام',    'وثيقة SRS ومخططات Use Case و Activity',                    -3,  true,  20],
            ['التقرير المرحلي', 'التصميم (ERD، Class Diagram) وما أُنجز من التطبيق',          10,  true,  20],
            ['التقرير النهائي', 'التوثيق الكامل للمشروع مع الكود المصدري',                   40,  false, 30],
            ['العرض النهائي',   'شرائح العرض أمام لجنة المناقشة',                           50,  false, 20],
        ];

        foreach ($deadlines as $index => [$title, $description, $days, $allowLate, $score]) {
            Deadline::updateOrCreate(
                ['academic_term_id' => $term->id, 'title' => $title],
                [
                    'description' => $description,
                    'due_at'      => today()->addDays($days)->setTime(23, 59),
                    'allow_late'  => $allowLate,
                    'max_score'   => $score,
                    'sort_order'  => $index + 1,
                ],
            );
        }
    }
}
