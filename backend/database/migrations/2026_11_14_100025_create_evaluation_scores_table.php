<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('criterion_id')->constrained('evaluation_criteria')->restrictOnDelete();
            $table->decimal('weight', 5, 2);                       // إصلاح ERD: لقطة من وزن المعيار لحظة التقييم
            $table->decimal('score', 5, 2);
            $table->text('notes')->nullable();
            $table->unique(['evaluation_id', 'criterion_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_scores');
    }
};
