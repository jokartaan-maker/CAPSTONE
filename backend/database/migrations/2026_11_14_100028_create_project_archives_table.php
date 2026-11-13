<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_archives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('archived_by')->constrained('users')->restrictOnDelete();
            $table->json('project_snapshot');
            $table->timestamp('archived_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_archives');
    }
};
