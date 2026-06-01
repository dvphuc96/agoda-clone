<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id', 'room_type_id', 'name', 'description',
        'free_cancellation_hours', 'cancellation_fee_percent',
        'is_non_refundable', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'free_cancellation_hours' => 'integer',
            'cancellation_fee_percent' => 'decimal:2',
            'is_non_refundable' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }
}
