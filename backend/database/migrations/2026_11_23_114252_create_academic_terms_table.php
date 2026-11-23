<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_terms', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);                              // مثال: الفصل الأول 2026-2027
            $table->string('academic_year', 9);                      // مثال: 2026-2027
            $table->enum('semester', ['first', 'second', 'summer']);
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_current')->default(false);           // الفصل الفعّال الآن
            $table->timestamps();

            $table->unique(['academic_year', 'semester']);           // لا يتكرر نفس الفصل
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_terms');
    }
};
