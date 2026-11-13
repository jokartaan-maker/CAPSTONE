<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\DiscussionStatus;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discussion_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->unique()->constrained()->cascadeOnDelete();
            // إصلاح ERD: يقترح المشرف موعدًا (status = proposed) ثم تعتمده اللجنة أو تعدّله (status = scheduled)
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('starts_at')->index();
            $table->dateTime('ends_at');
            $table->string('room', 50)->index();
            $table->enum('status', DiscussionStatus::values())->default(DiscussionStatus::Proposed->value)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discussion_schedules');
    }
};
