<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // مواعيد التسليم (مراحل المشروع) في كل فصل، تنشئها اللجنة/الإدارة
        Schema::create('deadlines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_term_id')->constrained('academic_terms')->restrictOnDelete();
            $table->string('title', 150);                          // مثال: التقرير المرحلي
            $table->text('description')->nullable();
            $table->dateTime('due_at');                            // dateTime وليس timestamp (MariaDB)
            $table->boolean('allow_late')->default(true);          // هل يُقبل التسليم بعد الموعد؟
            $table->unsignedSmallInteger('max_score')->nullable(); // العلامة العظمى لهذه المرحلة
            $table->unsignedTinyInteger('sort_order')->default(0); // ترتيب المراحل
            $table->timestamps();

            $table->index(['academic_term_id', 'due_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deadlines');
    }
};
