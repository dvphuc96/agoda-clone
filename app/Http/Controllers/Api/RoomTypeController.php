<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomTypeResource;
use App\Models\RoomType;
use Illuminate\Http\Request;

class RoomTypeController extends Controller
{
    public function show(RoomType $roomType, Request $request)
    {
        $roomType->load(['hotel.location', 'images']);

        if ($request->filled(['check_in', 'check_out'])) {
            $request->validate([
                'check_in' => ['date', 'after_or_equal:today'],
                'check_out' => ['date', 'after:check_in'],
            ]);
            $roomType->check_in = $request->check_in;
            $roomType->check_out = $request->check_out;
        }

        return new RoomTypeResource($roomType);
    }
}
