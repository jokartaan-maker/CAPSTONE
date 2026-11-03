<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {

        $roles = [
            'student'    => ['طالب', 'يختار الفكرة ويشكّل الفريق ويسلّم التقارير'],
            'supervisor' => ['مشرف', 'يطرح الأفكار ويتابع الفرق ويقيّمها'],
            'admin'      => ['إدارة / لجنة علمية', 'يعتمد الأفكار ويدير المستخدمين والأرشيف والمواعيد'],
        ];

        foreach ($roles as $name => [$display, $description]) {
            Role::updateOrCreate(
                ['name' => $name],
                ['display_name' => $display, 'description' => $description]
            );
        }

       
        $permissions = [
            'ideas.browse'          => 'تصفح الأفكار المعتمدة والبحث فيها',
            'ideas.create'          => 'طرح فكرة مشروع',
            'ideas.precheck'        => 'الفحص المسبق لتشابه الفكرة',
            'ideas.review'          => 'اعتماد الأفكار والتحقق من تكرارها',
            'similarity.report'     => 'عرض تقرير التشابه واتخاذ قرار التكرار',
            'similarity.settings'   => 'ضبط أوزان وعتبات التشابه',
            'teams.create'          => 'إنشاء فريق',
            'join_requests.create'  => 'تقديم طلب انضمام',
            'join_requests.decide'  => 'الموافقة على طلبات الانضمام',
            'submissions.upload'    => 'رفع التقارير والملفات',
            'feedback.create'       => 'التعليق على الملفات وإضافة الملاحظات',
            'evaluations.team'      => 'تقييم أداء الفريق',
            'evaluations.member'    => 'تقييم فردي لعضو الفريق',
            'discussions.view'      => 'عرض مواعيد المناقشات',
            'discussions.manage'    => 'تحديد مواعيد المناقشات وتعديلها',
            'deadlines.manage'      => 'تحديد مواعيد التسليمات المرحلية',
            'archive.manage'        => 'الأرشفة',
            'reports.view'          => 'الإحصائيات والتقارير',
            'users.manage'          => 'إدارة المستخدمين وتعيين المشرفين',
            'academic_years.manage' => 'إدارة السنوات والفصول الدراسية',
            'import.manage'         => 'استيراد مشاريع الأرشيف',
            'audit.view'            => 'عرض سجل العمليات',
            'tasks.view'            => 'استعراض المهام',
            'tasks.create'          => 'إنشاء مهمة',
            'tasks.assign'          => 'إسناد المهام',
            'tasks.evaluate'        => 'تقييم المهام',
        ];

        foreach ($permissions as $name => $display) {
            Permission::updateOrCreate(['name' => $name], ['display_name' => $display]);
        }

        $studentOnly = ['teams.create', 'join_requests.create', 'submissions.upload'];

        $map = [
            'student' => [
                'ideas.browse', 'teams.create', 'join_requests.create',
                'submissions.upload', 'discussions.view',
                'tasks.view', 'tasks.create', 'tasks.assign',
            ],
            'supervisor' => [
                'ideas.browse', 'ideas.create', 'ideas.precheck',
                'join_requests.decide', 'feedback.create',
                'evaluations.team', 'evaluations.member', 'discussions.view',
                'tasks.view', 'tasks.create', 'tasks.assign', 'tasks.evaluate',
            ],
            'admin' => array_values(array_diff(array_keys($permissions), $studentOnly)),
        ];

        foreach ($map as $roleName => $permissionNames) {
            $role = Role::where('name', $roleName)->firstOrFail();
            $role->permissions()->sync(
                Permission::whereIn('name', $permissionNames)->pluck('id')
            );
        }
    }
}