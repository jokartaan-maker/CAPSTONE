<?php

namespace Database\Seeders;

use App\Enums\CriterionScope;
use App\Enums\RegistrationStatus;
use App\Enums\TermName;
use App\Enums\TermStatus;
use App\Models\AcademicTerm;
use App\Models\EvaluationCriterion;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * بيانات تجريبية للتطوير فقط (تعمل عندما APP_ENV=local).
 * كلمة مرور كل الحسابات: password
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $term = AcademicTerm::updateOrCreate(
            ['academic_year' => '2026-2027', 'term_name' => TermName::First],
            ['starts_at' => '2026-09-01', 'ends_at' => '2027-01-31', 'status' => TermStatus::Active]
        );

        $users = [
            ['committee', 'عضو اللجنة العلمية', 'committee@capstone.test'],
            ['supervisor', 'د. خالد إسماعيل', 'supervisor1@capstone.test'],
            ['supervisor', 'د. مشرف ثانٍ', 'supervisor2@capstone.test'],
            ['student', 'طالب أول', 'student1@capstone.test'],
            ['student', 'طالب ثانٍ', 'student2@capstone.test'],
            ['student', 'طالب ثالث', 'student3@capstone.test'],
            ['student', 'طالب رابع', 'student4@capstone.test'],
        ];

        foreach ($users as [$role, $name, $email]) {
            $user = User::updateOrCreate(['email' => $email], [
                'name' => $name,
                'password' => 'password',
                'is_active' => true,
                'registration_status' => RegistrationStatus::Approved,
                'requested_role' => $role === 'admin' ? null : $role,
            ]);
            $user->roles()->syncWithoutDetaching([Role::where('name', $role)->firstOrFail()->id]);
        }

        // معايير تجريبية فقط — المعايير الحقيقية تحددها اللجنة العلمية (UC-46). مجموع كل نطاق = 100
        $criteria = [
            [CriterionScope::Team, 'جودة التحليل والتصميم', 30],
            [CriterionScope::Team, 'جودة التنفيذ', 40],
            [CriterionScope::Team, 'التوثيق والعرض', 30],
            [CriterionScope::Member, 'المشاركة', 30],
            [CriterionScope::Member, 'الالتزام بالمهام', 30],
            [CriterionScope::Member, 'جودة العمل المنجز', 40],
        ];

        foreach ($criteria as [$scope, $name, $weight]) {
            EvaluationCriterion::updateOrCreate(
                ['academic_term_id' => $term->id, 'name' => $name, 'scope' => $scope],
                ['weight' => $weight, 'is_active' => true]
            );
        }
    }
}
