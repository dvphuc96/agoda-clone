<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsHotelOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isHotelOwner()) {
            return response()->json(['message' => 'Access denied. Hotel owner role required.'], 403);
        }

        return $next($request);
    }
}
