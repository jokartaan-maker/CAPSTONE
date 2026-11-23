<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // الرموز القديمة كانت نصاً عادياً، نحذفها لأنها صالحة 10 دقائق فقط
        DB::table('student_otp_tokens')->delete();

        Schema::table('student_otp_tokens', function (Blueprint $table) {
            // الرمز يُخزَّن كـ hash (60 حرفاً) بدل 6 أرقام ظاهرة
            $table->string('otp', 255)->change();

            // عدد المحاولات الخاطئة: بعد 5 يُلغى الرمز
            $table->unsignedTinyInteger('attempts')->default(0)->after('otp');
        });
    }

    public function down(): void
    {
        Schema::table('student_otp_tokens', function (Blueprint $table) {
            $table->dropColumn('attempts');
        });
    }
};
