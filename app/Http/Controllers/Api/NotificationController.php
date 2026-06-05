<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\NotificationRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notificationRecords()
            ->with(['booking'])
            ->latest()
            ->paginate((int) $request->input('per_page', 15));

        return NotificationResource::collection($notifications);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()
            ->notificationRecords()
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markAsRead(Request $request, NotificationRecord $notification): JsonResponse
    {
        $notification = $this->findOwnedNotification($request, $notification);

        if (! $notification) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $notification->markAsRead();

        return response()->json(new NotificationResource($notification->fresh()));
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()
            ->notificationRecords()
            ->unread()
            ->update(['read_at' => Carbon::now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function destroy(Request $request, NotificationRecord $notification): JsonResponse
    {
        $notification = $this->findOwnedNotification($request, $notification);

        if (! $notification) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $notification->delete();

        return response()->json([], 204);
    }

    private function findOwnedNotification(Request $request, NotificationRecord $notification): ?NotificationRecord
    {
        if ($notification->user_id !== $request->user()->id) {
            return null;
        }

        return $notification;
    }
}
