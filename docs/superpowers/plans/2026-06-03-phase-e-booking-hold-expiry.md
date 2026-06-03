# Implementation Plan: Phase E — Booking Hold & Expiry

## Overview

Thêm booking expiry: booking pending quá thời gian cấu hình sẽ tự hủy và nhả phòng. Countdown timer trên frontend.

## Steps

### Step 1: Migration — Add expires_at to bookings

**File**: `database/migrations/2026_06_07_000001_add_expires_at_to_bookings_table.php`

- Add nullable timestamp `expires_at` to bookings table.
- Add index on `[status, expires_at]` for efficient expiry query.

### Step 2: Update Booking model

**File**: `app/Models/Booking.php`

- Add `expires_at` to fillable/casts.
- Add accessor `remaining_seconds`: `max(0, Carbon::parse($this->expires_at)->diffInSeconds(now()))`.

### Step 3: Update BookingService::create

**File**: `app/Services/BookingService.php`

- After creating booking with `status = 'pending'`, set `expires_at = now() + config('booking.hold_minutes', 30)`.
- Add config value in `config/booking.php` or `config('app.booking_hold_minutes', 30)`.

### Step 4: Booking expiry command

**File**: `app/Console/Commands/ExpirePendingBookings.php`

- Query: `Booking::where('status', 'pending')->where('expires_at', '<', now())`.
- For each: set status to `cancelled`, set `cancel_reason = 'expired'`, log.
- Send notification to user.
- Return count of expired bookings.

### Step 5: Schedule the command

**File**: `app/Console/Kernel.php` (or `routes/console.php` for Laravel 11+)

- Schedule `ExpirePendingBookings` to run every 5 minutes.

### Step 6: Add config

**File**: `config/booking.php` (new file)

- `hold_minutes` => env('BOOKING_HOLD_MINUTES', 30).

### Step 7: Update BookingResource

**File**: `app/Http/Resources/BookingResource.php`

- Add `expires_at` and `remaining_seconds` fields.

### Step 8: Frontend — Countdown timer component

**File**: `frontend/src/client/components/BookingCountdown.tsx` (new)

- Props: `expiresAt: string`.
- Display MM:SS countdown.
- When reaches 0, show "Booking expired" message.
- Use `setInterval` with cleanup.

### Step 9: Frontend — Integrate countdown

**Files**:
- `frontend/src/client/pages/BookingDetailPage.tsx` — show countdown for pending bookings.
- `frontend/src/client/pages/BookingPage.tsx` — show countdown after booking creation.
- `frontend/src/client/pages/MyBookingsPage.tsx` — show remaining time on pending booking cards.

### Step 10: Frontend — Expiry redirect

**File**: `frontend/src/client/pages/BookingDetailPage.tsx`

- When countdown reaches 0, refetch booking. If expired, show expired state with "Search again" CTA.

### Step 11: i18n keys

**Files**: `frontend/src/shared/i18n/locales/vi.ts`, `en.ts`, `types.ts`

- Add under `booking`: `expiresAt`, `remaining`, `expiredTitle`, `expiredBody`, `searchAgain`.

## Files Changed

| File | Action |
| --- | --- |
| database/migrations/..._add_expires_at_to_bookings_table.php | new |
| config/booking.php | new |
| app/Console/Commands/ExpirePendingBookings.php | new |
| app/Models/Booking.php | modify |
| app/Services/BookingService.php | modify |
| app/Console/Kernel.php or routes/console.php | modify |
| app/Http/Resources/BookingResource.php | modify |
| frontend/src/client/components/BookingCountdown.tsx | new |
| frontend/src/client/pages/BookingDetailPage.tsx | modify |
| frontend/src/client/pages/BookingPage.tsx | modify |
| frontend/src/client/pages/MyBookingsPage.tsx | modify |
| frontend/src/shared/i18n/locales/vi.ts | modify |
| frontend/src/shared/i18n/locales/en.ts | modify |
| frontend/src/shared/i18n/types.ts | modify |

## Risk

Low. Additive changes only. No existing behavior modified except adding `expires_at` to new bookings.
