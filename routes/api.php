<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RoomTypeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\TransferBookingController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\LocationController as AdminLocationController;
use App\Http\Controllers\Api\Admin\HotelController as AdminHotelController;
use App\Http\Controllers\Api\Admin\RoomTypeController as AdminRoomTypeController;
use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\RefundController as AdminRefundController;
use App\Http\Controllers\Api\Admin\BookingPolicyController as AdminBookingPolicyController;
use App\Http\Controllers\Api\Admin\TransferVehicleTypeController as AdminTransferVehicleTypeController;
use App\Http\Controllers\Api\Admin\TransferRouteController as AdminTransferRouteController;
use App\Http\Controllers\Api\Admin\TransferBookingController as AdminTransferBookingController;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Location routes
Route::get('/locations', [LocationController::class, 'index']);
Route::get('/locations/{slug}/hotels', [LocationController::class, 'hotels']);

// Hotel routes
Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/featured', [HotelController::class, 'featured']);
Route::get('/hotels/{slug}', [HotelController::class, 'show']);
Route::get('/hotels/{slug}/rooms', [HotelController::class, 'rooms']);

// Room type routes
Route::get('/room-types/{roomType}', [RoomTypeController::class, 'show']);

// Transfer routes
Route::get('/transfers/search-options', [TransferController::class, 'searchOptions']);
Route::get('/transfers/quotes', [TransferController::class, 'quotes']);
Route::get('/transfers/hotels/{hotel}/quotes', [TransferController::class, 'hotelQuotes']);

// Payment callbacks (public - gateway redirects)
Route::get('/payments/vnpay/callback', [PaymentController::class, 'vnpayCallback']);
Route::get('/payments/momo/callback', [PaymentController::class, 'momoCallback']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{bookingCode}', [BookingController::class, 'show']);
    Route::post('/bookings/{bookingCode}/cancel-request', [BookingController::class, 'cancelRequest']);
    Route::delete('/bookings/{bookingCode}', [BookingController::class, 'destroy']);

    Route::post('/payments/create', [PaymentController::class, 'create']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);

    Route::get('/notifications', [NotificationController::class, 'index']);

    Route::get('/transfers/bookings', [TransferBookingController::class, 'index']);
    Route::post('/transfers/bookings', [TransferBookingController::class, 'store']);
    Route::get('/transfers/bookings/{bookingCode}', [TransferBookingController::class, 'show']);
    Route::post('/transfers/bookings/{bookingCode}/cancel', [TransferBookingController::class, 'cancel']);
});

Route::middleware(['auth:sanctum', 'isAdmin'])->prefix('admin')->group(function () {
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
    Route::get('/dashboard/revenue-chart', [AdminDashboardController::class, 'revenueChart']);
    Route::get('/dashboard/booking-status', [AdminDashboardController::class, 'bookingStatus']);

    Route::apiResource('locations', AdminLocationController::class);
    Route::post('/locations/{location}/image', [AdminLocationController::class, 'uploadImage']);

    Route::apiResource('hotels', AdminHotelController::class);
    Route::patch('/hotels/{hotel}/toggle-status', [AdminHotelController::class, 'toggleStatus']);
    Route::post('/hotels/{hotel}/images', [AdminHotelController::class, 'uploadImages']);
    Route::delete('/hotels/images/{image}', [AdminHotelController::class, 'destroyImage']);

    Route::get('/hotels/{hotel}/room-types', [AdminRoomTypeController::class, 'index']);
    Route::post('/hotels/{hotel}/room-types', [AdminRoomTypeController::class, 'store']);
    Route::get('/room-types/{roomType}', [AdminRoomTypeController::class, 'show']);
    Route::put('/room-types/{roomType}', [AdminRoomTypeController::class, 'update']);
    Route::delete('/room-types/{roomType}', [AdminRoomTypeController::class, 'destroy']);
    Route::post('/room-types/{roomType}/images', [AdminRoomTypeController::class, 'uploadImages']);

    Route::get('/bookings/export', [AdminBookingController::class, 'export']);
    Route::get('/bookings', [AdminBookingController::class, 'index']);
    Route::get('/bookings/{booking}', [AdminBookingController::class, 'show']);
    Route::patch('/bookings/{booking}/status', [AdminBookingController::class, 'updateStatus']);

    Route::get('/payments', [AdminPaymentController::class, 'index']);
    Route::get('/payments/{payment}', [AdminPaymentController::class, 'show']);

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{user}', [AdminUserController::class, 'show']);
    Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole']);
    Route::patch('/users/{user}/toggle-active', [AdminUserController::class, 'toggleActive']);

    Route::get('/refunds', [AdminRefundController::class, 'index']);
    Route::get('/refunds/{refund}', [AdminRefundController::class, 'show']);
    Route::patch('/refunds/{refund}/status', [AdminRefundController::class, 'updateStatus']);

    Route::get('/booking-policies', [AdminBookingPolicyController::class, 'index']);
    Route::post('/booking-policies', [AdminBookingPolicyController::class, 'store']);
    Route::get('/booking-policies/{bookingPolicy}', [AdminBookingPolicyController::class, 'show']);
    Route::put('/booking-policies/{bookingPolicy}', [AdminBookingPolicyController::class, 'update']);
    Route::delete('/booking-policies/{bookingPolicy}', [AdminBookingPolicyController::class, 'destroy']);

    Route::apiResource('transfer-vehicle-types', AdminTransferVehicleTypeController::class);
    Route::post('/transfer-routes/{transferRoute}/refresh-distance', [AdminTransferRouteController::class, 'refreshDistance']);
    Route::apiResource('transfer-routes', AdminTransferRouteController::class);
    Route::get('/transfer-bookings', [AdminTransferBookingController::class, 'index']);
    Route::get('/transfer-bookings/{transferBooking}', [AdminTransferBookingController::class, 'show']);
    Route::patch('/transfer-bookings/{transferBooking}/status', [AdminTransferBookingController::class, 'updateStatus']);
});
