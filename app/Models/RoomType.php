<?php

namespace App\Models;

use App\Services\BookingPolicyService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomType extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id', 'name', 'description', 'max_guests',
        'bed_type', 'size_sqm', 'price_per_night', 'amenities', 'total_rooms',
    ];

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'price_per_night' => 'decimal:2',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(HotelImage::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function priceOverrides(): HasMany
    {
        return $this->hasMany(PriceOverride::class);
    }

    public function getAvailableRoomsCount(string $checkIn, string $checkOut): int
    {
        $policyService = app(BookingPolicyService::class);

        $bookedCount = Booking::where('room_type_id', $this->id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->where('check_in', '<', $checkOut)
                      ->where('check_out', '>', $checkIn);
            })
            ->get()
            ->reject(fn (Booking $booking) => $policyService->isPendingExpired($booking))
            ->sum('guests');

        return max(0, $this->total_rooms - $bookedCount);
    }
}
