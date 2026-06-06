<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyAccount extends Model
{
    protected $fillable = [
        'user_id',
        'points_balance',
        'lifetime_points',
        'tier',
        'tier_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'points_balance' => 'integer',
            'lifetime_points' => 'integer',
            'tier_updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(LoyaltyTransaction::class);
    }

    public static function tierForPoints(int $lifetimePoints): string
    {
        return match (true) {
            $lifetimePoints >= 20000 => 'platinum',
            $lifetimePoints >= 5000 => 'gold',
            $lifetimePoints >= 1000 => 'silver',
            default => 'bronze',
        };
    }

    public static function multiplierForTier(string $tier): float
    {
        return match ($tier) {
            'platinum' => 2.0,
            'gold' => 1.5,
            'silver' => 1.2,
            default => 1.0,
        };
    }
}
