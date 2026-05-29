<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::query()
            ->with(['user', 'roomType.hotel.location', 'payments'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('hotel_id')) {
            $query->whereHas('roomType', fn ($q) => $q->where('hotel_id', $request->hotel_id));
        }
        if ($request->filled('date_from')) {
            $query->whereDate('check_in', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('check_out', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('booking_code', 'like', "%{$request->search}%")
                    ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$request->search}%")->orWhere('email', 'like', "%{$request->search}%"));
            });
        }
        if ($request->filled('room_type_id')) {
            $query->where('room_type_id', $request->room_type_id);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return BookingResource::collection($query->paginate((int) $request->input('per_page', 15)));
    }

    public function show(Booking $booking): BookingResource
    {
        return new BookingResource($booking->load(['user', 'roomType.hotel.location', 'roomType.images', 'payments']));
    }

    public function updateStatus(Request $request, Booking $booking): BookingResource
    {
        $data = $request->validate(['status' => ['required', 'in:pending,confirmed,cancelled,completed']]);
        $booking->update($data);

        return new BookingResource($booking->refresh()->load(['user', 'roomType.hotel.location', 'payments']));
    }

    public function export(Request $request): StreamedResponse
    {
        $filename = 'bookings-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($request) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Booking Code', 'User', 'Hotel', 'Room', 'Check In', 'Check Out', 'Guests', 'Total', 'Status']);

            Booking::with(['user', 'roomType.hotel'])
                ->latest()
                ->chunk(200, function ($bookings) use ($handle) {
                    foreach ($bookings as $booking) {
                        fputcsv($handle, [
                            $booking->booking_code,
                            $booking->user?->email,
                            $booking->roomType?->hotel?->name,
                            $booking->roomType?->name,
                            $booking->check_in?->format('Y-m-d'),
                            $booking->check_out?->format('Y-m-d'),
                            $booking->guests,
                            $booking->total_price,
                            $booking->status,
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
