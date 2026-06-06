<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendBookingReminders extends Command
{
    protected $signature = 'bookings:send-reminders';

    protected $description = 'Send check-in reminder notifications for confirmed bookings arriving tomorrow';

    public function handle(NotificationService $notificationService): int
    {
        $tomorrow = now()->addDay()->toDateString();

        $bookings = Booking::where('status', 'confirmed')
            ->whereDate('check_in', $tomorrow)
            ->whereNull('reminder_sent_at')
            ->with(['user', 'roomType.hotel'])
            ->get();

        $count = 0;

        foreach ($bookings as $booking) {
            $hotel = $booking->roomType?->hotel;

            $notificationService->create(
                $booking->user,
                $booking,
                'booking_reminder',
                'database',
                [
                    'booking_code' => $booking->booking_code,
                    'hotel_name' => $hotel?->name,
                    'hotel_address' => $hotel?->address,
                    'check_in' => $booking->check_in->format('Y-m-d'),
                    'check_out' => $booking->check_out->format('Y-m-d'),
                    'checkin_time' => $hotel?->checkin_time,
                    'hotel_phone' => $hotel?->phone,
                ]
            );

            $booking->update(['reminder_sent_at' => now()]);

            Log::info("Booking reminder sent for {$booking->booking_code}", [
                'booking_id' => $booking->id,
                'user_id' => $booking->user_id,
            ]);

            $count++;
        }

        $this->info("Sent {$count} booking reminder(s).");

        return self::SUCCESS;
    }
}
