<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_otp_tokens', function (Blueprint $table) {
            // timestamp في MariaDB يحصل تلقائياً على ON UPDATE CURRENT_TIMESTAMP
            // فيتغير وقت الانتهاء مع أي تعديل على الصف (مثل زيادة attempts)
            // dateTime لا يملك هذه الخاصية
            $table->dateTime('expires_at')->change();
        });
    }

    public function down(): void
    {
        Schema::table('student_otp_tokens', function (Blueprint $table) {
            $table->timestamp('expires_at')->change();
        });
    }
};
