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
        Schema::create('loyalty_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('points_balance')->default(0);
            $table->unsignedInteger('lifetime_points')->default(0);
            $table->string('tier', 20)->default('bronze');
            $table->timestamp('tier_updated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loyalty_account_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['earn', 'redeem', 'expire', 'adjust']);
            $table->unsignedInteger('points');
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description');
            $table->string('reference')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
        Schema::dropIfExists('loyalty_accounts');
    }
};
