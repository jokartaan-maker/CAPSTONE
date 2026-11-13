<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\CommitteeRole;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discussion_committee', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discussion_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->enum('role_in_committee', CommitteeRole::values())->default(CommitteeRole::Member->value);
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['discussion_schedule_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discussion_committee');
    }
};
