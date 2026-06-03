<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpirePendingBookings extends Command
{
    protected $signature = 'bookings:expire';

    protected $description = 'Expire pending bookings past their hold time';

    public function handle(): int
    {
        $bookings = Booking::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->get();

        $count = 0;

        foreach ($bookings as $booking) {
            $booking->update(['status' => 'cancelled']);

            Log::info("Booking {$booking->booking_code} expired and cancelled", [
                'booking_id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'expired_at' => $booking->expires_at,
            ]);

            $count++;
        }

        $this->info("Expired {$count} pending booking(s).");

        return self::SUCCESS;
    }
}
