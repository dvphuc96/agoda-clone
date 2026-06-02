<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfer_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transfer_vehicle_type_id')->constrained()->cascadeOnDelete();
            $table->string('airport_code', 10);
            $table->string('airport_name');
            $table->enum('direction', ['airport_to_hotel', 'hotel_to_airport']);
            $table->decimal('price', 12, 2);
            $table->string('currency', 3)->default('VND');
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['hotel_id', 'transfer_vehicle_type_id', 'airport_code', 'direction'], 'transfer_route_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfer_routes');
    }
};
