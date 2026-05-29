<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->withCount('bookings')->latest();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->paginate((int) $request->input('per_page', 15)));
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load(['bookings.roomType.hotel', 'bookings.payments'])->loadCount('bookings'));
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['role' => ['required', 'in:user,admin']]);
        $user->update($data);

        return response()->json($user->refresh()->loadCount('bookings'));
    }

    public function toggleActive(User $user): JsonResponse
    {
        $user->update(['is_active' => !($user->is_active ?? true)]);

        return response()->json($user->refresh()->loadCount('bookings'));
    }
}
