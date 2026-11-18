<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('students', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100);
    $table->string('email', 100)->unique();
    $table->string('password');
    $table->string('phone', 20)->nullable();
    $table->string('university_number', 20)->unique();
    $table->string('major', 100);
    $table->unsignedTinyInteger('study_year');
    $table->json('skills')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamp('email_verified_at')->nullable();
    $table->rememberToken();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
