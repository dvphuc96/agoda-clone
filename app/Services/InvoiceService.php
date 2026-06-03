<?php

namespace App\Services;

use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class InvoiceService
{
    public function isEligible(Booking $booking): bool
    {
        return in_array($booking->status, ['confirmed', 'completed'])
            && $booking->payments->contains(fn ($p) => $p->status === 'paid');
    }

    public function generatePdf(Booking $booking)
    {
        $booking->load(['user', 'roomType.hotel.location', 'payments' => fn ($q) => $q->where('status', 'paid')]);

        if (! $this->isEligible($booking)) {
            throw new \InvalidArgumentException('Booking is not eligible for invoice generation.');
        }

        $paidPayment = $booking->payments->first(fn ($p) => $p->status === 'paid');
        $hotel = $booking->roomType->hotel;
        $checkIn = Carbon::parse($booking->check_in);
        $checkOut = Carbon::parse($booking->check_out);
        $nights = $checkIn->diffInDays($checkOut);
        $pricePerNight = $nights > 0 ? round($booking->total_price / $nights, 2) : $booking->total_price;

        $data = [
            'invoice_number' => $booking->booking_code,
            'invoice_date' => $paidPayment->paid_at ? Carbon::parse($paidPayment->paid_at)->format('d/m/Y') : now()->format('d/m/Y'),
            'user_name' => $booking->user->name,
            'user_email' => $booking->user->email,
            'hotel_name' => $hotel->name,
            'hotel_address' => $hotel->address,
            'room_type' => $booking->roomType->name,
            'check_in' => $checkIn->format('d/m/Y'),
            'check_out' => $checkOut->format('d/m/Y'),
            'nights' => $nights,
            'price_per_night' => $pricePerNight,
            'subtotal' => $booking->total_price,
            'total' => $booking->total_price,
            'payment_method' => $paidPayment->method ?? 'N/A',
            'paid_at' => $paidPayment->paid_at ? Carbon::parse($paidPayment->paid_at)->format('d/m/Y H:i') : 'N/A',
        ];

        return Pdf::loadView('invoices.booking', $data)
            ->setPaper('a4', 'portrait')
            ->stream("invoice-{$booking->booking_code}.pdf");
    }
}
