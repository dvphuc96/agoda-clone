<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\Auditable;

class Coupon extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'min_booking_value',
        'max_uses',
        'used_count',
        'max_uses_per_user',
        'starts_at',
        'expires_at',
        'is_active',
        'applicable_hotels',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'applicable_hotels' => 'array',
            'is_active' => 'boolean',
            'discount_value' => 'decimal:2',
            'min_booking_value' => 'decimal:2',
        ];
    }

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isActive(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $now = now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }

        if ($this->max_uses && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    public function canBeUsedByUser(int $userId, ?int $hotelId = null): bool
    {
        if (! $this->isActive()) {
            return false;
        }

        $usageCount = $this->usages()->where('user_id', $userId)->count();

        if ($this->max_uses_per_user && $usageCount >= $this->max_uses_per_user) {
            return false;
        }

        if ($hotelId && $this->applicable_hotels && ! empty($this->applicable_hotels)) {
            return in_array($hotelId, $this->applicable_hotels);
        }

        return true;
    }
}