<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ideas', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();                    // مثال: IDEA-001
            $table->string('title', 200);
            $table->string('field', 100);                            // المجال (من قائمة الأقسام)
            $table->text('description');
            $table->text('problem')->nullable();                     // المشكلة التي يحلها المشروع
            $table->json('features')->nullable();                    // قائمة الميزات
            $table->json('requirements')->nullable();                // قائمة المتطلبات
            $table->json('tech_stack')->nullable();                  // التقنيات
            $table->json('tags')->nullable();                        // وسوم قصيرة للبطاقة
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            $table->foreignId('academic_term_id')->constrained('academic_terms')->restrictOnDelete();
            $table->foreignId('supervisor_id')->nullable()->constrained('supervisors')->restrictOnDelete();

            $table->dateTime('approved_at')->nullable();             // dateTime وليس timestamp (MariaDB)
            $table->timestamps();

            $table->index(['academic_term_id', 'status']);           // استعلام الطالب الأساسي
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ideas');
    }
};
