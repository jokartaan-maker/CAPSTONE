<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\JoinRequestStatus;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('join_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('message')->nullable();                  // إضافة: رسالة اختيارية مع الطلب (UC-42)
            $table->enum('status', JoinRequestStatus::values())->default(JoinRequestStatus::Pending->value)->index();
            $table->text('decision_reason')->nullable();          // إضافة: سبب الرفض (UC-17)
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
            // إصلاح ERD: طلب معلّق واحد فقط لنفس الطالب ونفس الفريق
            $table->unsignedTinyInteger('pending_key')->nullable()->storedAs("CASE WHEN status = 'pending' THEN 1 ELSE NULL END");
            $table->unique(['team_id', 'student_id', 'pending_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('join_requests');
    }
};
