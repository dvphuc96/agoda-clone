<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'room_type_id', 'coupon_id', 'booking_code', 'check_in', 'check_out',
        'guests', 'special_requests', 'total_price', 'discount_amount', 'status', 'modified_at',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'total_price' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'modified_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            $booking->booking_code = 'BK' . strtoupper(Str::random(6));
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(NotificationRecord::class);
    }

    public function transferBookings(): HasMany
    {
        return $this->hasMany(TransferBooking::class);
    }

    public function modifications(): HasMany
    {
        return $this->hasMany(BookingModification::class);
    }

    public function latestModification()
    {
        return $this->hasOne(BookingModification::class)->latestOfMany();
    }
}
