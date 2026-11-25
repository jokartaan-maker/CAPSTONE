<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);

            // unique: كل فكرة يعمل عليها فريق واحد فقط
            $table->foreignId('idea_id')->unique()->constrained('ideas')->restrictOnDelete();
            $table->foreignId('supervisor_id')->constrained('supervisors')->restrictOnDelete();
            $table->foreignId('academic_term_id')->constrained('academic_terms')->restrictOnDelete();

            $table->unsignedTinyInteger('capacity')->default(4);              // أقصى عدد أعضاء
            $table->enum('status', ['forming', 'active', 'closed'])->default('forming');
            $table->timestamps();

            $table->unique(['academic_term_id', 'name']);                     // لا يتكرر اسم الفريق في نفس الفصل
            $table->index(['supervisor_id', 'academic_term_id']);             // لحساب عدد فرق المشرف
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
