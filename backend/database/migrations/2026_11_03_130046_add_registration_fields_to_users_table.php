<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('registration_status', 20)->default('approved')->after('is_active');
            $table->string('requested_role', 20)->nullable()->after('registration_status');
            $table->index('registration_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['registration_status']);
            $table->dropColumn(['registration_status', 'requested_role']);
        });
    }
};