<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class TransferVehicleType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'passenger_capacity',
        'luggage_capacity',
        'image',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'passenger_capacity' => 'integer',
            'luggage_capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (TransferVehicleType $vehicleType) {
            $vehicleType->slug = $vehicleType->slug ?: Str::slug($vehicleType->name);
        });
    }

    public function routes(): HasMany
    {
        return $this->hasMany(TransferRoute::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(TransferBooking::class);
    }
}
