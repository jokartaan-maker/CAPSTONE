<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\SimilarityBand;
use App\Enums\SimilarityCheckType;
use App\Enums\SimilarityDecision;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('similarity_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained('ideas')->cascadeOnDelete();
            $table->foreignId('matched_idea_id')->constrained('ideas')->cascadeOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('check_type', SimilarityCheckType::values());
            $table->unsignedTinyInteger('rank');                  // 1..5
            $table->decimal('similarity', 5, 4)->nullable();      // NULL عند الفحص المحدود
            $table->decimal('lexical_score', 5, 4);
            $table->boolean('flagged')->default(false);
            $table->boolean('limited_check')->default(false);     // إضافة: خدمة المعنى معطلة فاستُخدم TF-IDF فقط
            $table->enum('band', SimilarityBand::values());
            $table->json('breakdown');
            $table->json('shared_elements');
            $table->enum('decision', SimilarityDecision::values())->nullable();
            $table->text('decision_reason')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
            $table->unique(['idea_id', 'matched_idea_id', 'check_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('similarity_checks');
    }
};
