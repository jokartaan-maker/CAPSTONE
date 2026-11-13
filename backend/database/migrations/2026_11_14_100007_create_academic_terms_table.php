<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\TermName;
use App\Enums\TermStatus;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_terms', function (Blueprint $table) {
            $table->id();
            $table->string('academic_year', 9);           // مثال: 2026-2027
            $table->enum('term_name', TermName::values());
            $table->date('starts_at');
            $table->date('ends_at');
            $table->enum('status', TermStatus::values())->default(TermStatus::Upcoming->value)->index();
            $table->timestamps();
            $table->unique(['academic_year', 'term_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_terms');
    }
};
