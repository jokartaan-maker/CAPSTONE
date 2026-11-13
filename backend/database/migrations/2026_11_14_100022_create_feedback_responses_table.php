<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\FeedbackResponseStatus;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_id')->constrained('feedback')->cascadeOnDelete();
            $table->foreignId('revised_version_id')->nullable()->constrained('submission_versions')->nullOnDelete();
            $table->foreignId('responder_id')->constrained('users')->restrictOnDelete();
            $table->text('response');
            $table->enum('status', FeedbackResponseStatus::values())->default(FeedbackResponseStatus::Submitted->value);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_responses');
    }
};
