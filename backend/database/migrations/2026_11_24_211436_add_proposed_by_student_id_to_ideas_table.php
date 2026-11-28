<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ideas', function (Blueprint $table) {
            // الطالب الذي اقترح الفكرة (null = فكرة أضافتها اللجنة أو مشرف)
            $table->foreignId('proposed_by_student_id')
                ->nullable()
                ->after('supervisor_id')
                ->constrained('students')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ideas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('proposed_by_student_id');
        });
    }
};
