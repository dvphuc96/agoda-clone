<?php

namespace App\Services;

use App\Models\Hotel;
use App\Models\NotificationRecord;
use App\Models\PriceAlert;
use App\Models\User;
use App\Notifications\PriceAlertNotification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class PriceAlertService
{
    public function createAlert(User $user, Hotel $hotel, float $targetPrice): PriceAlert
    {
        return PriceAlert::updateOrCreate(
            ['user_id' => $user->id, 'hotel_id' => $hotel->id],
            ['target_price' => $targetPrice, 'is_active' => true]
        );
    }

    public function getUserAlerts(User $user): Collection
    {
        return PriceAlert::where('user_id', $user->id)
            ->with('hotel')
            ->orderByDesc('created_at')
            ->get();
    }

    public function deleteAlert(PriceAlert $alert): void
    {
        $alert->delete();
    }

    public function toggleAlert(PriceAlert $alert): PriceAlert
    {
        $alert->update(['is_active' => !$alert->is_active]);
        return $alert->fresh();
    }

    public function checkAndNotify(): int
    {
        $count = 0;

        $alerts = PriceAlert::active()
            ->with(['hotel.roomTypes', 'user'])
            ->where(fn ($q) => $q->whereNull('last_notified_at')->orWhere('last_notified_at', '<', now()->subDay()))
            ->get();

        foreach ($alerts as $alert) {
            $cheapestPrice = $alert->hotel->roomTypes()
                ->where('is_active', true)
                ->min('base_price_per_night');

            if ($cheapestPrice !== null && $cheapestPrice <= $alert->target_price) {
                $alert->user->notify(new PriceAlertNotification($alert, (float) $cheapestPrice));

                NotificationRecord::create([
                    'user_id' => $alert->user_id,
                    'booking_id' => null,
                    'type' => 'price_alert',
                    'channel' => 'database',
                    'status' => 'sent',
                    'payload' => [
                        'hotel_name' => $alert->hotel->name,
                        'target_price' => (float) $alert->target_price,
                        'current_price' => $cheapestPrice,
                    ],
                    'sent_at' => now(),
                ]);

                $alert->update(['last_notified_at' => now()]);
                $count++;
            }
        }

        return $count;
    }
}
