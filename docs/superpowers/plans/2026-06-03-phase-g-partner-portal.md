# Implementation Plan: Phase G — Hotel Owner / Partner Portal

## Overview

Thêm role `hotel_owner` cho phép khách sạn tự quản lý thông tin, phòng, giá, và xem booking của mình.

## Steps

### Step 1: Migration — hotel_user pivot table

**File**: `database/migrations/2026_06_08_000001_create_hotel_user_table.php`

- `hotel_user`: id, user_id (FK users), hotel_id (FK hotels), role enum('owner','manager'), created_at.
- Unique constraint on (user_id, hotel_id).

### Step 2: Update User model

**File**: `app/Models/User.php`

- Add `ownedHotels()` belongsToMany relationship through hotel_user.
- Add `isHotelOwner()` method: check if user has any hotel_user records.
- Add `ownsHotel($hotelId)` method: check specific hotel ownership.

### Step 3: HotelUser model

**File**: `app/Models/HotelUser.php` (new)

- Pivot model with user_id, hotel_id, role.
- Relationships to User and Hotel.

### Step 4: Partner middleware

**File**: `app/Http/Middleware/IsHotelOwner.php` (new)

- Check `auth()->user()->isHotelOwner()`.
- Abort 403 if not.

### Step 5: Partner Controllers

**Files** (new):
- `app/Http/Controllers/Api/Partner/PartnerDashboardController.php` — stats for partner's hotels.
- `app/Http/Controllers/Api/Partner/PartnerHotelController.php` — list/update own hotels.
- `app/Http/Controllers/Api/Partner/PartnerRoomTypeController.php` — manage room types for own hotels.
- `app/Http/Controllers/Api/Partner/PartnerBookingController.php` — view bookings for own hotels.
- `app/Http/Controllers/Api/Partner/PartnerPriceOverrideController.php` — manage price overrides.
- `app/Http/Controllers/Api/Partner/PartnerReviewController.php` — view reviews for own hotels.

All queries scoped to `auth()->user()->ownedHotels()->pluck('id')`.

### Step 6: Routes

**File**: `routes/api.php`

```php
Route::middleware(['auth:sanctum', 'isHotelOwner'])->prefix('partner')->group(function () {
    Route::get('/dashboard', [PartnerDashboardController::class, 'stats']);
    Route::get('/hotels', [PartnerHotelController::class, 'index']);
    Route::put('/hotels/{hotel}', [PartnerHotelController::class, 'update']);
    Route::get('/hotels/{hotel}/room-types', [PartnerRoomTypeController::class, 'index']);
    Route::post('/hotels/{hotel}/room-types', [PartnerRoomTypeController::class, 'store']);
    Route::put('/room-types/{roomType}', [PartnerRoomTypeController::class, 'update']);
    Route::get('/bookings', [PartnerBookingController::class, 'index']);
    Route::get('/bookings/{booking}', [PartnerBookingController::class, 'show']);
    // price overrides, reviews...
});
```

### Step 7: Admin — Manage partner assignments

**File**: `app/Http/Controllers/Api/Admin/UserController.php` (modify)

- Add endpoint to assign hotel to user: `POST /admin/users/{user}/assign-hotel`.
- Add endpoint to remove: `DELETE /admin/users/{user}/hotels/{hotel}`.

**File**: `frontend/src/admin/pages/users/UserDetailPage.tsx` or `UserListPage.tsx` (modify)

- Show assigned hotels in user detail.
- Add/remove hotel assignment UI.

### Step 8: Frontend — Partner layout

**File**: `frontend/src/partner/components/layout/PartnerLayout.tsx` (new)

- Simplified sidebar: Dashboard, Hotels, Rooms, Bookings, Reviews.
- Different from admin layout (no locations, users, coupons, etc.).

### Step 9: Frontend — Partner pages

**Files** (new):
- `frontend/src/partner/pages/PartnerDashboardPage.tsx` — stats for own hotels.
- `frontend/src/partner/pages/PartnerHotelsPage.tsx` — list own hotels, edit basic info.
- `frontend/src/partner/pages/PartnerRoomsPage.tsx` — manage room types + price overrides.
- `frontend/src/partner/pages/PartnerBookingsPage.tsx` — view bookings for own hotels.
- `frontend/src/partner/pages/PartnerReviewsPage.tsx` — view reviews.

### Step 10: Frontend — API client

**File**: `frontend/src/shared/api/partner.ts` (new)

- `partnerApi` object with typed methods matching partner endpoints.

### Step 11: Frontend — Routes

**File**: `frontend/src/App.tsx` (modify)

- Add partner routes with partner layout guard.

### Step 12: i18n

**Files**: `types.ts`, `vi.ts`, `en.ts`

Add `partner` section with all labels for partner portal.

## Files Changed

| File | Action |
| --- | --- |
| database/migrations/..._create_hotel_user_table.php | new |
| app/Models/HotelUser.php | new |
| app/Models/User.php | modify |
| app/Http/Middleware/IsHotelOwner.php | new |
| app/Http/Controllers/Api/Partner/*.php | new (6 files) |
| routes/api.php | modify |
| frontend/src/shared/api/partner.ts | new |
| frontend/src/partner/components/layout/PartnerLayout.tsx | new |
| frontend/src/partner/pages/*.tsx | new (5 pages) |
| frontend/src/admin/pages/users/UserListPage.tsx | modify |
| frontend/src/App.tsx | modify |
| frontend/src/shared/i18n/* | modify |

## Risk

Medium. Scoped access control is critical — partner must NEVER see data from other hotels. Thorough testing of scoping logic required.
