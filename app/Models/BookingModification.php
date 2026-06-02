<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingModification extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_id',
        'old_check_in',
        'old_check_out',
        'old_guests',
        'old_total_price',
        'new_check_in',
        'new_check_out',
        'new_guests',
        'new_total_price',
        'status',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'old_check_in' => 'date',
            'old_check_out' => 'date',
            'old_total_price' => 'decimal:2',
            'new_check_in' => 'date',
            'new_check_out' => 'date',
            'new_total_price' => 'decimal:2',
            'status' => 'string',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
