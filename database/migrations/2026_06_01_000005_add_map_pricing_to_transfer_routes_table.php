<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transfer_routes', function (Blueprint $table) {
            $table->decimal('pickup_latitude', 10, 7)->nullable()->after('airport_name');
            $table->decimal('pickup_longitude', 10, 7)->nullable()->after('pickup_latitude');
            $table->unsignedInteger('distance_meters')->nullable()->after('duration_minutes');
            $table->unsignedInteger('duration_seconds')->nullable()->after('distance_meters');
            $table->decimal('base_fee', 12, 2)->default(50000)->after('duration_seconds');
            $table->decimal('price_per_km', 12, 2)->default(14000)->after('base_fee');
            $table->decimal('price_override', 12, 2)->nullable()->after('price_per_km');
            $table->string('pricing_source', 20)->default('manual')->after('price_override');
        });
    }

    public function down(): void
    {
        Schema::table('transfer_routes', function (Blueprint $table) {
            $table->dropColumn([
                'pickup_latitude',
                'pickup_longitude',
                'distance_meters',
                'duration_seconds',
                'base_fee',
                'price_per_km',
                'price_override',
                'pricing_source',
            ]);
        });
    }
};
