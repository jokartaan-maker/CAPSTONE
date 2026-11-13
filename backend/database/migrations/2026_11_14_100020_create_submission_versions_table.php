<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submission_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->restrictOnDelete();
            $table->unsignedInteger('version_no');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('file_size');
            $table->text('change_note')->nullable();
            $table->boolean('is_late')->default(false);            // إضافة: هل رُفع هذا الإصدار بعد الموعد
            $table->timestamp('uploaded_at')->useCurrent();
            $table->unique(['submission_id', 'version_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_versions');
    }
};
