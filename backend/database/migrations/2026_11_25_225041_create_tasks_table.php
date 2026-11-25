<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();   // حذف الفريق يحذف مهامه

            $table->string('title', 150);
            $table->text('description')->nullable();

            // العضو المسؤول (اختياري): إذا حُذف الطالب تبقى المهمة بلا مسؤول
            $table->foreignId('assigned_to')->nullable()->constrained('students')->nullOnDelete();

            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->enum('status', ['todo', 'in_progress', 'done'])->default('todo');
            $table->date('due_date')->nullable();
            $table->dateTime('completed_at')->nullable();                          // dateTime وليس timestamp (MariaDB)

            // من أنشأ المهمة: قائد الفريق (طالب) أو المشرف، واحد منهما فقط
            $table->foreignId('created_by_student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->foreignId('created_by_supervisor_id')->nullable()->constrained('supervisors')->nullOnDelete();

            $table->timestamps();

            $table->index(['team_id', 'status']);   // مهام الفريق حسب الحالة
            $table->index('assigned_to');           // مهام عضو معيّن
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
