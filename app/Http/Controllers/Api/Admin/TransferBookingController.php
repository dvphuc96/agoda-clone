<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransferBookingResource;
use App\Models\TransferBooking;
use Illuminate\Http\Request;

class TransferBookingController extends Controller
{
    public function index(Request $request)
    {
        $query = TransferBooking::query()
            ->with(['user', 'hotel.location', 'vehicleType', 'route'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('hotel_id')) {
            $query->where('hotel_id', $request->hotel_id);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('pickup_datetime', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('pickup_datetime', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $query->where(function ($inner) use ($request) {
                $inner->where('booking_code', 'like', "%{$request->search}%")
                    ->orWhere('contact_name', 'like', "%{$request->search}%")
                    ->orWhere('contact_phone', 'like', "%{$request->search}%")
                    ->orWhereHas('user', fn ($user) => $user->where('email', 'like', "%{$request->search}%"));
            });
        }

        return TransferBookingResource::collection($query->paginate((int) $request->input('per_page', 15)));
    }

    public function show(TransferBooking $transferBooking): TransferBookingResource
    {
        return new TransferBookingResource($transferBooking->load(['user', 'hotel.location', 'vehicleType', 'route']));
    }

    public function updateStatus(Request $request, TransferBooking $transferBooking): TransferBookingResource
    {
        $data = $request->validate(['status' => ['required', 'in:pending,confirmed,cancelled,completed']]);
        $updates = $data['status'] === 'cancelled' ? ['cancelled_at' => now()] : ['cancelled_at' => null];
        $transferBooking->update([...$data, ...$updates]);

        return new TransferBookingResource($transferBooking->refresh()->load(['user', 'hotel.location', 'vehicleType', 'route']));
    }
}
