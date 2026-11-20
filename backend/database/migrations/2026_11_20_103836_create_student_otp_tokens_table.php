<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_otp_tokens', function (Blueprint $table) {
            $table->string('email', 100)->primary();
            $table->string('otp', 6);               // 6-digit code
            $table->string('reset_token')->nullable(); // يُنشأ بعد التحقق من الـ OTP
            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_otp_tokens');
    }
};
