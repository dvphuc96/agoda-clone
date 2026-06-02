<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    public function __construct(
        private PasswordResetService $passwordResetService,
    ) {}

    public function sendResetLinkEmail(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->validated('email');

        $token = $this->passwordResetService->generateToken($email);

        $user = User::where('email', $email)->first();
        $user->notify(new ResetPasswordNotification($token, $email));

        return response()->json([
            'message' => 'Reset link sent to your email',
        ]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $success = $this->passwordResetService->resetPassword(
            $validated['email'],
            $validated['token'],
            $validated['password'],
        );

        if (!$success) {
            return response()->json([
                'message' => 'Invalid or expired reset token',
            ], 400);
        }

        return response()->json([
            'message' => 'Password reset successfully',
        ]);
    }
}
