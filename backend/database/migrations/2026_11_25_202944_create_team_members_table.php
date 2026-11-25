<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();       // حذف الفريق يحذف عضوياته
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete();
            $table->foreignId('academic_term_id')->constrained('academic_terms')->restrictOnDelete();

            $table->enum('role', ['leader', 'member'])->default('member');
            $table->dateTime('joined_at');                                                // dateTime وليس timestamp (MariaDB)
            $table->timestamps();

            // القاعدة الذهبية: الطالب في فريق واحد فقط في كل فصل، تفرضها قاعدة البيانات نفسها
            $table->unique(['student_id', 'academic_term_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
