<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfer_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transfer_route_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transfer_vehicle_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('hotel_id')->constrained()->cascadeOnDelete();
            $table->string('booking_code', 10)->unique();
            $table->string('airport_code', 10);
            $table->string('airport_name');
            $table->enum('direction', ['airport_to_hotel', 'hotel_to_airport']);
            $table->dateTime('pickup_datetime');
            $table->unsignedInteger('passengers');
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->string('flight_number')->nullable();
            $table->text('special_requests')->nullable();
            $table->decimal('total_price', 12, 2);
            $table->string('currency', 3)->default('VND');
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfer_bookings');
    }
};
