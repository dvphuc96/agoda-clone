<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\HotelController;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Destination routes
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{slug}/hotels', [DestinationController::class, 'hotels']);

// Hotel routes
Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/featured', [HotelController::class, 'featured']);
Route::get('/hotels/{slug}', [HotelController::class, 'show']);
Route::get('/hotels/{slug}/rooms', [HotelController::class, 'rooms']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{bookingCode}', [BookingController::class, 'show']);
    Route::delete('/bookings/{bookingCode}', [BookingController::class, 'destroy']);
});
