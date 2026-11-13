<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\EvaluationStatus;
use App\Enums\EvaluationType;
use App\Enums\EvaluatorRole;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluator_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->unsignedBigInteger('student_key')->storedAs('COALESCE(student_id, 0)'); // يسمح بقيد عدم التكرار مع التقييم الجماعي
            $table->enum('evaluation_type', EvaluationType::values());
            $table->enum('evaluator_role', EvaluatorRole::values());
            $table->enum('status', EvaluationStatus::values())->default(EvaluationStatus::Draft->value); // إضافة: مسودة مخفية عن الطلاب (UC-22)
            $table->decimal('total_score', 5, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['team_id', 'evaluator_id', 'student_key', 'evaluation_type'], 'evaluations_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
