<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\IdeaSource;
use App\Enums\IdeaStatus;
use App\Enums\SupervisorStatus;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ideas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('related_idea_id')->nullable()->constrained('ideas')->nullOnDelete(); // الفكرة الأصلية عند الامتداد
            $table->foreignId('proposed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('import_batch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('academic_term_id')->constrained()->restrictOnDelete();
            $table->string('supervisor_name', 100)->nullable();   // للأرشيف المستورد
            $table->enum('supervisor_status', SupervisorStatus::values())->nullable();
            $table->string('title');
            $table->text('description');
            $table->text('problem');
            $table->text('solution');
            $table->text('target_users');
            $table->text('features');
            $table->text('requirements');
            $table->text('tech_stack');
            $table->text('keywords');
            $table->string('domain', 100)->index();
            $table->enum('source', IdeaSource::values());
            $table->enum('status', IdeaStatus::values())->default(IdeaStatus::Draft->value)->index();
            $table->text('difference_note')->nullable();
            $table->text('extension_note')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ideas');
    }
};
