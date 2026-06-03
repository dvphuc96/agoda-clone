<?php

namespace App\Http\Controllers\Api\Partner;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class PartnerController extends Controller
{
    protected function checkHotelOwnership(int $hotelId): Hotel
    {
        $hotel = Hotel::findOrFail($hotelId);

        if (!auth()->user()->ownsHotel($hotelId)) {
            throw new AccessDeniedHttpException('You do not have access to this hotel.');
        }

        return $hotel;
    }

    protected function ownedHotelIds(): array
    {
        return auth()->user()->ownedHotels()->pluck('hotels.id')->toArray();
    }
}
