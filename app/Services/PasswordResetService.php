<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetService
{
    public function generateToken(string $email): string
    {
        $plainToken = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => hash('sha256', $plainToken),
                'created_at' => now(),
            ]
        );

        return $plainToken;
    }

    public function validateToken(string $email, string $token): bool
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$record) {
            return false;
        }

        if (!hash_equals($record->token, hash('sha256', $token))) {
            return false;
        }

        $expiresAt = now()->subMinutes(60);

        return $record->created_at > $expiresAt;
    }

    public function resetPassword(string $email, string $token, string $password): bool
    {
        if (!$this->validateToken($email, $token)) {
            return false;
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return false;
        }

        $user->update(['password' => Hash::make($password)]);

        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();

        return true;
    }
}
