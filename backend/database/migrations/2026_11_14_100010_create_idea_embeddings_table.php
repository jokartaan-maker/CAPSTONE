<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('idea_embeddings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('model_name', 100);
            $table->json('embedding');
            $table->longText('normalized_text');
            $table->json('title_tfidf');
            $table->json('problem_tfidf');
            $table->json('features_set');
            $table->json('target_users_set');
            $table->string('domain_normalized', 100);
            $table->json('tech_set');
            $table->json('keywords_set');
            $table->char('text_hash', 64);
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idea_embeddings');
    }
};
