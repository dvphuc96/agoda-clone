<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceOverride extends Model
{
    protected $fillable = [
        'room_type_id',
        'start_date',
        'end_date',
        'price_per_night',
        'label',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'price_per_night' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public static function hasOverlappingRange(int $roomTypeId, string $startDate, string $endDate, ?int $excludeId = null): bool
    {
        $query = static::where('room_type_id', $roomTypeId)
            ->where('start_date', '<=', $endDate)
            ->where('end_date', '>=', $startDate);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
