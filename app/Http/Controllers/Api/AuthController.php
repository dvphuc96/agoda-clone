<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Notifications\WelcomeNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());
        $token = $user->createToken('auth-token')->plainTextToken;

        event(new Registered($user));
        $user->notify(new WelcomeNotification());

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->validated())) {
            return response()->json(['message' => 'Thong tin dang nhap khong chinh xac'], 401);
        }

        $user = Auth::user();
        if (($user->is_active ?? true) === false) {
            Auth::logout();
            return response()->json(['message' => 'Tai khoan da bi vo hieu hoa'], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Dang xuat thanh cong']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
