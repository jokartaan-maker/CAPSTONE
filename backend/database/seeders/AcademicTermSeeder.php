<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use Illuminate\Database\Seeder;

class AcademicTermSeeder extends Seeder
{
    public function run(): void
    {
        // فصل سابق (منتهٍ)
        AcademicTerm::updateOrCreate(
            ['academic_year' => '2025-2026', 'semester' => 'second'],
            [
                'name'       => 'الفصل الثاني 2025-2026',
                'start_date' => '2026-02-15',
                'end_date'   => '2026-06-30',
                'is_current' => false,
            ],
        );

        // الفصل الحالي
        AcademicTerm::updateOrCreate(
            ['academic_year' => '2026-2027', 'semester' => 'first'],
            [
                'name'       => 'الفصل الأول 2026-2027',
                'start_date' => '2026-09-15',
                'end_date'   => '2027-01-31',
                'is_current' => true,
            ],
        );
    }
}
