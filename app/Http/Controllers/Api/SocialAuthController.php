<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect to the OAuth provider.
     */
    public function redirect(string $provider): JsonResponse
    {
        if (!$this->isValidProvider($provider)) {
            return response()->json(['message' => 'Unsupported provider.'], 400);
        }

        if (!$this->isProviderConfigured($provider)) {
            return response()->json(['message' => 'Social login is not configured for this provider.'], 501);
        }

        $url = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    /**
     * Handle the OAuth callback.
     */
    public function callback(string $provider): JsonResponse
    {
        if (!$this->isValidProvider($provider)) {
            return response()->json(['message' => 'Unsupported provider.'], 400);
        }

        if (!$this->isProviderConfigured($provider)) {
            return response()->json(['message' => 'Social login is not configured for this provider.'], 501);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to authenticate with provider.'], 401);
        }

        return $this->authenticateUser($provider, $socialUser);
    }

    /**
     * SPA-friendly token exchange: accept an access token from the frontend.
     */
    public function token(Request $request, string $provider): JsonResponse
    {
        if (!$this->isValidProvider($provider)) {
            return response()->json(['message' => 'Unsupported provider.'], 400);
        }

        if (!$this->isProviderConfigured($provider)) {
            return response()->json(['message' => 'Social login is not configured for this provider.'], 501);
        }

        $request->validate([
            'access_token' => ['required', 'string'],
        ]);

        try {
            $socialUser = Socialite::driver($provider)
                ->stateless()
                ->userFromToken($request->input('access_token'));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid access token.'], 401);
        }

        return $this->authenticateUser($provider, $socialUser);
    }

    /**
     * Find or create a local user and issue a Sanctum token.
     */
    private function authenticateUser(string $provider, $socialUser): JsonResponse
    {
        // Try to find existing user by provider + provider_id
        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        // Try to find by email and link the provider
        if (!$user && $socialUser->getEmail()) {
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                ]);
            }
        }

        // Create a new user
        if (!$user) {
            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'email' => $socialUser->getEmail() ?? "{$provider}_{$socialUser->getId()}@gostay.local",
                'password' => bcrypt(str()->random(32)),
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
            ]);
        }

        // Deactivate any expired tokens (housekeeping)
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Check if the provider is supported.
     */
    private function isValidProvider(string $provider): bool
    {
        return in_array($provider, ['google', 'facebook']);
    }

    /**
     * Check if the provider has been configured in services.php.
     */
    private function isProviderConfigured(string $provider): bool
    {
        $clientId = config("services.{$provider}.client_id");

        return !empty($clientId);
    }
}
