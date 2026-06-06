<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyTransaction extends Model
{
    protected $fillable = [
        'loyalty_account_id',
        'type',
        'points',
        'booking_id',
        'description',
        'reference',
    ];

    protected function casts(): array
    {
        return [
            'points' => 'integer',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(LoyaltyAccount::class, 'loyalty_account_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
