<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // تسليمات الفرق: كل رفع = إصدار جديد، القديم لا يُحذف
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deadline_id')->constrained('deadlines')->restrictOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('students')->nullOnDelete();

            $table->unsignedSmallInteger('version');               // 1، 2، 3...
            $table->string('file_path');                           // المسار داخل storage/app/private
            $table->string('original_name');                       // اسم الملف كما رفعه الطالب
            $table->string('mime_type', 150)->nullable();
            $table->unsignedInteger('size');                       // بالبايت
            $table->string('notes', 1000)->nullable();             // ملاحظة الطالب مع التسليم
            $table->boolean('is_late')->default(false);
            $table->dateTime('submitted_at');

            // التقييم (يملؤه المشرف في مرحلته)
            $table->decimal('grade', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('supervisors')->nullOnDelete();
            $table->dateTime('graded_at')->nullable();

            $table->timestamps();

            // لا يتكرر رقم الإصدار لنفس الفريق ونفس الموعد
            $table->unique(['deadline_id', 'team_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
