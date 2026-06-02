<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TransferBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'booking_id',
        'transfer_route_id',
        'transfer_vehicle_type_id',
        'hotel_id',
        'booking_code',
        'airport_code',
        'airport_name',
        'direction',
        'pickup_datetime',
        'passengers',
        'contact_name',
        'contact_phone',
        'flight_number',
        'special_requests',
        'total_price',
        'currency',
        'status',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'pickup_datetime' => 'datetime',
            'cancelled_at' => 'datetime',
            'passengers' => 'integer',
            'total_price' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (TransferBooking $booking) {
            $booking->booking_code = $booking->booking_code ?: 'TR' . strtoupper(Str::random(6));
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(TransferRoute::class, 'transfer_route_id');
    }

    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(TransferVehicleType::class, 'transfer_vehicle_type_id');
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }
}
