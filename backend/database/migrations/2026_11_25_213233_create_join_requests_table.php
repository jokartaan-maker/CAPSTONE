<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('join_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();       // حذف الفريق يحذف طلباته
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete(); // الطالب صاحب الطلب أو المدعو
            $table->foreignId('academic_term_id')->constrained('academic_terms')->restrictOnDelete();

            // request: الطالب طلب الانضمام ← يرد القائد
            // invitation: القائد دعا الطالب ← يرد الطالب
            $table->enum('type', ['request', 'invitation']);
            $table->enum('status', ['pending', 'accepted', 'rejected', 'cancelled'])->default('pending');

            $table->string('message', 500)->nullable();   // رسالة قصيرة اختيارية
            $table->dateTime('responded_at')->nullable(); // وقت القبول/الرفض/الإلغاء (dateTime وليس timestamp)
            $table->timestamps();

            $table->index(['student_id', 'status']);      // طلبات الطالب المعلّقة
            $table->index(['team_id', 'status']);         // طلبات الفريق المعلّقة
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('join_requests');
    }
};
