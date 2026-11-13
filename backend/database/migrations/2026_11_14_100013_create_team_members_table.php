<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\TeamRole;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_term_id')->constrained()->restrictOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->restrictOnDelete();
            $table->enum('role_in_team', TeamRole::values())->default(TeamRole::Member->value);
            $table->timestamp('joined_at')->useCurrent();
            $table->unique(['team_id', 'student_id']);
            $table->unique(['student_id', 'academic_term_id']);   // الطالب في فريق واحد فقط في الفصل
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
