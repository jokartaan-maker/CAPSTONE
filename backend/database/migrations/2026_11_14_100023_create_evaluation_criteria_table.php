<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\CriterionScope;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_criteria', function (Blueprint $table) {
            $table->id();
            // إصلاح ERD: المعايير مرتبطة بالفصل، ولا تُعدَّل بعد استخدامها بل يُنشأ معيار جديد ويُعطَّل القديم (UC-46)
            $table->foreignId('academic_term_id')->constrained()->restrictOnDelete();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->decimal('weight', 5, 2);                       // نسبة مئوية، مجموع المعايير الفعّالة لكل نطاق = 100
            $table->decimal('max_score', 5, 2)->default(100);
            $table->enum('scope', CriterionScope::values());
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_criteria');
    }
};
