<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('max_guests')->default(2);
            $table->enum('bed_type', ['single', 'double', 'twin', 'king']);
            $table->decimal('size_sqm', 6, 2)->nullable();
            $table->decimal('price_per_night', 12, 2);
            $table->json('amenities')->nullable();
            $table->integer('total_rooms')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
