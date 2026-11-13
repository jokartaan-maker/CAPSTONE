<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\SubmissionStatus;
use App\Enums\SubmissionType;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deadline_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->enum('type', SubmissionType::values());
            $table->unsignedInteger('current_version_no')->default(0);
            $table->enum('status', SubmissionStatus::values())->default(SubmissionStatus::NotSubmitted->value)->index();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
            $table->unique(['team_id', 'deadline_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
