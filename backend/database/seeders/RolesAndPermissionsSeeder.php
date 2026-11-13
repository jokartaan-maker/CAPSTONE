<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * الأدوار الأربعة والصلاحيات وفق مصفوفة الصلاحيات في التقرير (الجدول 4-3).
 * القاعدة: اللجنة العلمية = القرار الأكاديمي، مدير النظام = الإدارة التقنية.
 */
class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'student'    => ['طالب', 'يقترح فكرة أو يتصفح الأفكار، ويكوّن الفريق، ويدير مهامه، ويسلّم التقارير'],
            'supervisor' => ['مشرف', 'يطرح الأفكار، ويتابع فرقه، ويضيف الملاحظات، ويقيّم الفريق وأعضاءه'],
            'committee'  => ['لجنة علمية', 'تعتمد الأفكار وتقرر في التشابه، وتجدول المناقشات، وتراجع التقييمات'],
            'admin'      => ['مدير النظام', 'يدير الحسابات والفصول والأرشيف والإعدادات وسجل التدقيق'],
        ];

        foreach ($roles as $name => [$display, $description]) {
            Role::updateOrCreate(['name' => $name], ['display_name' => $display, 'description' => $description]);
        }

        $permissions = [
            // الأفكار وكشف التشابه
            'ideas.browse'             => 'تصفح الأفكار المعتمدة والبحث فيها',
            'ideas.create'             => 'طرح فكرة مشروع',
            'ideas.precheck'           => 'الفحص المسبق لتشابه الفكرة',
            'ideas.review'             => 'مراجعة الأفكار واعتمادها',
            'similarity.view'          => 'عرض تقرير التشابه الكامل',
            'similarity.decide'        => 'تسجيل قرار التشابه',
            'similarity.settings'      => 'ضبط إعدادات التشابه وعتباته',
            // الفرق
            'teams.create'             => 'إنشاء فريق',
            'teams.monitor'            => 'لوحة متابعة الفرق',
            'join_requests.create'     => 'تقديم طلب انضمام',
            'join_requests.decide'     => 'البتّ في طلبات الانضمام',
            // المهام
            'tasks.view'               => 'عرض المهام',
            'tasks.manage'             => 'إنشاء المهام وتعديلها وإسنادها',
            'tasks.evaluate'           => 'مراجعة إنجاز المهام',
            // المواعيد والتسليمات والملاحظات
            'deadlines.view'           => 'عرض المواعيد النهائية',
            'deadlines.manage_team'    => 'تحديد مواعيد فريق',
            'deadlines.manage_term'    => 'تحديد مواعيد الفصل',
            'submissions.view'         => 'عرض التسليمات وإصداراتها',
            'submissions.upload'       => 'رفع التقارير والملفات',
            'feedback.view'            => 'عرض الملاحظات',
            'feedback.create'          => 'إضافة الملاحظات وإغلاقها',
            'feedback.respond'         => 'الرد على الملاحظات',
            // التقييم
            'evaluations.view'         => 'عرض التقييمات',
            'evaluations.create'       => 'تقييم الفريق وأعضائه',
            'evaluations.review'       => 'مراجعة التقييمات وإضافة تقييم اللجنة',
            'evaluations.criteria'     => 'إدارة معايير التقييم',
            // المناقشات
            'discussions.view'         => 'عرض جدول المناقشات',
            'discussions.suggest'      => 'اقتراح مواعيد المناقشة',
            'discussions.manage'       => 'جدولة المناقشات واعتمادها',
            // الأرشيف والتقارير
            'archive.view'             => 'تصفح الأرشيف',
            'archive.manage'           => 'أرشفة المشاريع المكتملة',
            'import.manage'            => 'استيراد الأرشيف من Excel',
            'reports.view'             => 'عرض الإحصائيات',
            'reports.export'           => 'تصدير التقارير PDF / Excel',
            // الإدارة
            'users.manage'             => 'إدارة المستخدمين',
            'registrations.approve'    => 'الموافقة على طلبات التسجيل',
            'supervisors.assign'       => 'تعيين المشرفين على الفرق',
            'recommendations.create'   => 'رفع توصيات إلى الإدارة',
            'recommendations.decide'   => 'البتّ في توصيات اللجنة',
            'terms.manage'             => 'إدارة الفصول الدراسية',
            'notifications.settings'   => 'إدارة إعدادات الإشعارات وقوالبها',
            'audit.view'               => 'عرض سجل التدقيق الكامل',
            'decisions_log.view'       => 'عرض سجل القرارات العلمية',
        ];

        foreach ($permissions as $name => $display) {
            Permission::updateOrCreate(['name' => $name], ['display_name' => $display]);
        }

        $map = [
            'student' => [
                'ideas.browse', 'ideas.create', 'ideas.precheck',
                'teams.create', 'join_requests.create',
                'tasks.view', 'tasks.manage',
                'deadlines.view', 'submissions.view', 'submissions.upload',
                'feedback.view', 'feedback.respond',
                'evaluations.view', 'discussions.view',
            ],
            'supervisor' => [
                'ideas.browse', 'ideas.create', 'ideas.precheck',
                'teams.monitor', 'join_requests.decide',
                'tasks.view', 'tasks.manage', 'tasks.evaluate',
                'deadlines.view', 'deadlines.manage_team',
                'submissions.view', 'feedback.view', 'feedback.create',
                'evaluations.view', 'evaluations.create',
                'discussions.view', 'discussions.suggest',
                'archive.view', 'reports.view',
            ],
            'committee' => [
                'ideas.browse', 'ideas.precheck', 'ideas.review',
                'similarity.view', 'similarity.decide', 'similarity.settings',
                'tasks.view',
                'deadlines.view', 'deadlines.manage_term',
                'submissions.view', 'feedback.view',
                'evaluations.view', 'evaluations.create', 'evaluations.review', 'evaluations.criteria',
                'discussions.view', 'discussions.manage',
                'archive.view', 'reports.view', 'reports.export',
                'recommendations.create', 'decisions_log.view',
            ],
            'admin' => [
                'ideas.browse', 'ideas.precheck', 'similarity.view',
                'discussions.view',
                'archive.view', 'archive.manage', 'import.manage',
                'reports.view', 'reports.export',
                'users.manage', 'registrations.approve', 'supervisors.assign',
                'recommendations.decide', 'terms.manage',
                'notifications.settings', 'audit.view',
            ],
        ];

        foreach ($map as $roleName => $permissionNames) {
            Role::where('name', $roleName)->firstOrFail()
                ->permissions()
                ->sync(Permission::whereIn('name', $permissionNames)->pluck('id'));
        }
    }
}
