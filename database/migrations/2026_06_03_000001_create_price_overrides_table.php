<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_type_id')->constrained('room_types')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('price_per_night', 10, 2);
            $table->string('label', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['room_type_id', 'start_date', 'end_date'], 'idx_overrides_room_dates');
            $table->index(['room_type_id', 'is_active'], 'idx_overrides_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_overrides');
    }
};
