<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function notice(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
                'verified' => true,
            ]);
        }

        return response()->json([
            'message' => 'Please verify your email address.',
            'verified' => false,
        ], 403);
    }

    public function verify(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
                'user' => $user,
            ]);
        }

        if (!hash_equals(
            sha1($user->getEmailForVerification()),
            (string) $request->route('hash')
        )) {
            return response()->json([
                'message' => 'Invalid verification link.',
            ], 403);
        }

        $user->markEmailAsVerified();

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => $user,
        ]);
    }

    public function resend(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ], 400);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification email sent.',
        ]);
    }
}
