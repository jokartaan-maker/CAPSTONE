<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\DeadlineStatus;
use App\Enums\SubmissionType;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deadlines', function (Blueprint $table) {
            $table->id();
            // إصلاح ERD: الموعد إما عام للفصل كله (team_id = NULL، تحدده اللجنة UC-27) أو خاص بفريق (يحدده المشرف UC-43)
            $table->foreignId('academic_term_id')->constrained()->restrictOnDelete();
            $table->foreignId('team_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->enum('submission_type', SubmissionType::values());
            $table->dateTime('due_at')->index();
            $table->enum('status', DeadlineStatus::values())->default(DeadlineStatus::Open->value);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deadlines');
    }
};
