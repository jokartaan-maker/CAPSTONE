<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\Task;
use App\Models\Team;
use Illuminate\Database\Seeder;

// مهام تجريبية لـ "فريق المبرمجين": حالات مختلفة، واحدة متأخرة، واحدة بلا مسؤول، وواحدة أنشأها المشرف
class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $team   = Team::where('name', 'فريق المبرمجين')->firstOrFail();
        $leader = Student::where('email', 'ahmad@aspu.edu.sy')->firstOrFail();
        $id     = fn (string $email) => Student::where('email', $email)->value('id');

        $tasks = [
            ['تحليل المتطلبات وكتابة SRS',    'جمع المتطلبات الوظيفية وغير الوظيفية', 'ahmad@aspu.edu.sy', 'high',   'done',        -10, false],
            ['تصميم قاعدة البيانات (ERD)',     'الجداول والعلاقات والقيود',            'lina@aspu.edu.sy',  'high',   'done',        -5,  false],
            ['بناء واجهة تسجيل الدخول',        null,                                   'omar@aspu.edu.sy',  'medium', 'in_progress', 3,   false],
            ['بناء API إدارة المواعيد',        'CRUD للمواعيد مع التحقق من التعارض',   'lina@aspu.edu.sy',  'high',   'todo',        7,   false],
            ['كتابة اختبارات الوحدة',          null,                                   'rama@aspu.edu.sy',  'low',    'todo',        -2,  false], // متأخرة
            ['إعداد عرض تقديمي للمرحلة الأولى', null,                                   null,                'medium', 'todo',        14,  false], // بلا مسؤول
            ['مراجعة مخطط قاعدة البيانات مع المشرف', 'إرسال الـ ERD النهائي قبل الاجتماع', 'lina@aspu.edu.sy', 'medium', 'todo',     5,   true],  // من المشرف
        ];

        foreach ($tasks as [$title, $description, $email, $priority, $status, $days, $bySupervisor]) {
            Task::updateOrCreate(
                ['team_id' => $team->id, 'title' => $title],
                [
                    'description'              => $description,
                    'assigned_to'              => $email ? $id($email) : null,
                    'priority'                 => $priority,
                    'status'                   => $status,
                    'due_date'                 => today()->addDays($days),
                    'completed_at'             => $status === 'done' ? now()->addDays($days) : null,
                    'created_by_student_id'    => $bySupervisor ? null : $leader->id,
                    'created_by_supervisor_id' => $bySupervisor ? $team->supervisor_id : null,
                ],
            );
        }
    }
}
