<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->with(['booking'])
            ->latest()
            ->paginate((int) $request->input('per_page', 15));

        return NotificationResource::collection($notifications);
    }
}
