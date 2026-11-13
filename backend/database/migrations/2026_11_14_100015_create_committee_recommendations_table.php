<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\RecommendationStatus;
use App\Enums\RecommendationType;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('committee_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('author_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('recommended_supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', RecommendationType::values());
            $table->json('payload')->nullable();
            $table->text('reason');
            $table->enum('status', RecommendationStatus::values())->default(RecommendationStatus::Pending->value)->index();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('committee_recommendations');
    }
};
