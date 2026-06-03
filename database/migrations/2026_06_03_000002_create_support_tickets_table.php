<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('booking_code', 20)->nullable();
            $table->string('subject');
            $table->enum('category', ['booking', 'payment', 'hotel', 'transfer', 'other'])->default('other');
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->timestamps();

            $table->index(['user_id', 'status'], 'idx_tickets_user');
            $table->index(['status', 'category'], 'idx_tickets_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
    }
};
