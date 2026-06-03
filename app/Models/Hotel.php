<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Hotel extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_id', 'name', 'slug', 'property_type', 'description', 'address',
        'star_rating', 'latitude', 'longitude', 'phone', 'email',
        'checkin_time', 'checkout_time', 'amenities', 'status',
    ];

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'checkin_time' => 'datetime:H:i',
            'checkout_time' => 'datetime:H:i',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Hotel $hotel) {
            $hotel->slug = $hotel->slug ?? Str::slug($hotel->name);
        });
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(HotelImage::class);
    }

    public function transferRoutes(): HasMany
    {
        return $this->hasMany(TransferRoute::class);
    }

    public function transferBookings(): HasMany
    {
        return $this->hasMany(TransferBooking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function avgRating(): ?float
    {
        return $this->reviews()
            ->where('status', 'approved')
            ->avg('rating');
    }
}
