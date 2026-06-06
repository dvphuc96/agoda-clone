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
        Schema::table('reviews', function (Blueprint $table) {
            $table->json('images')->nullable()->after('comment');
            $table->text('owner_response')->nullable()->after('images');
            $table->timestamp('owner_responded_at')->nullable()->after('owner_response');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['images', 'owner_response', 'owner_responded_at']);
        });
    }
};
