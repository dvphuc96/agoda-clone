<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransferRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'transfer_vehicle_type_id',
        'airport_code',
        'airport_name',
        'pickup_latitude',
        'pickup_longitude',
        'direction',
        'price',
        'currency',
        'duration_minutes',
        'distance_meters',
        'duration_seconds',
        'base_fee',
        'price_per_km',
        'price_override',
        'pricing_source',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'pickup_latitude' => 'decimal:7',
            'pickup_longitude' => 'decimal:7',
            'duration_minutes' => 'integer',
            'distance_meters' => 'integer',
            'duration_seconds' => 'integer',
            'base_fee' => 'decimal:2',
            'price_per_km' => 'decimal:2',
            'price_override' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(TransferVehicleType::class, 'transfer_vehicle_type_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(TransferBooking::class);
    }
}
