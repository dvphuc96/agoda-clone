# Implementation Plan: Phase H — UX Enhancements

## Overview

4 tính năng nâng cao trải nghiệm: Chat/AI Assistant, Room Availability Calendar, Photo Gallery/Lightbox, Social Login.

---

## H.1: Chat / AI Assistant

### Backend

**File**: `app/Http/Controllers/Api/ChatController.php` (new)
- `POST /chat/sessions` — tạo session mới.
- `POST /chat/sessions/{session}/messages` — gửi message, nhận AI response.
- `GET /chat/sessions` — list user sessions.
- `GET /chat/sessions/{session}/messages` — list messages.

**File**: `app/Services/ChatService.php` (new)
- `processMessage(session, message)` → parse intent → search hotels → format response.
- Simple intent parsing: destination, guests, dates, budget.
- If AI provider unavailable, use rule-based matching as fallback.

**Migrations**:
- `chat_sessions`: id, user_id, context (JSON), created_at.
- `chat_messages`: id, session_id, role enum('user','assistant'), content, created_at.

### Frontend

**File**: `frontend/src/client/components/chat/ChatWidget.tsx` (new)
- Floating button bottom-right, expandable panel.
- Quick reply buttons (destination, guests, dates, budget) — using existing i18n `chat.*` keys.
- Hotel cards inline when AI finds results.
- Text input for free-form messages.

**File**: `frontend/src/shared/api/chat.ts` (new)
- Types and API methods for chat sessions/messages.

---

## H.2: Room Availability Calendar

### Backend

**File**: `app/Http/Controllers/Api/Admin/RoomTypeController.php` (modify)
- Add `availabilityCalendar(RoomType $roomType, Request $request)` method.
- Query bookings for the month, calculate available rooms per day.

**File**: `app/Http/Controllers/Api/RoomTypeController.php` (modify)
- Add public `availabilityCalendar` for client (only shows available/unavailable, not booking details).

### Frontend

**File**: `frontend/src/shared/components/AvailabilityCalendar.tsx` (new)
- Grid 7 columns (Mon-Sun), rows = weeks in month.
- Color coding: green (available), yellow (low stock ≤2), red (sold out).
- Navigation arrows for prev/next month.
- Click day to see detail (admin: bookings for that day).

---

## H.3: Photo Gallery & Lightbox

### Frontend Only (no backend changes needed)

**File**: `frontend/src/shared/components/PhotoGallery.tsx` (new)
- Masonry/grid layout for hotel images.
- "View all N photos" button.

**File**: `frontend/src/shared/components/Lightbox.tsx` (new)
- Fullscreen overlay with backdrop blur.
- Previous/Next navigation (keyboard arrows + swipe).
- Close button (Esc + click outside).
- Image counter (1/N).
- Optional: zoom on click.

**Integration**:
- `HotelDetailPage.tsx` — replace current image display with PhotoGallery.
- `AdminRoomTypeListPage` or hotel image management — use Lightbox for preview.

---

## H.4: Social Login (Google/Facebook)

### Backend

**File**: `database/migrations/2026_06_08_add_social_to_users_table.php` (new)
- Add `provider` (nullable string: google/facebook).
- Add `provider_id` (nullable string).
- Add `avatar` (nullable string) for social avatar URL.

**File**: `app/Http/Controllers/Api/SocialAuthController.php` (new)
- `GET /auth/social/{provider}/redirect` — redirect to OAuth provider.
- `GET /auth/social/{provider}/callback` — handle callback, find or create user.
- `POST /auth/social/{provider}/token` — mobile/SPA flow (exchange token).

**Package**: `composer require laravel/socialite`.

### Frontend

**File**: `frontend/src/client/pages/LoginPage.tsx` (modify)
- Add "Continue with Google" and "Continue with Facebook" buttons.
- Icons for Google/Facebook.

**File**: `frontend/src/client/pages/RegisterPage.tsx` (modify)
- Same social login buttons.

**File**: `frontend/src/client/pages/SocialCallbackPage.tsx` (new)
- Handle OAuth callback, extract token, redirect.

---

## i18n for Phase H

All new sections: `chat` (already exists in types.ts), `availabilityCalendar`, `photoGallery`, `socialLogin`.

## Files Summary

| Feature | New Files | Modified Files |
| --- | --- | --- |
| Chat/AI | 4 (controller, service, 2 migrations, chat.ts, ChatWidget.tsx) | api.php, App.tsx, i18n |
| Calendar | 1 (AvailabilityCalendar.tsx) | 2 controllers, i18n |
| Gallery | 2 (PhotoGallery.tsx, Lightbox.tsx) | HotelDetailPage.tsx |
| Social Login | 2 (migration, SocialAuthController.php, SocialCallbackPage.tsx) | LoginPage, RegisterPage, api.php, i18n |

## Risk

- Chat/AI: Medium. Depends on AI provider availability. Rule-based fallback reduces risk.
- Calendar: Low. Read-only data aggregation.
- Gallery: Low. Pure frontend component.
- Social Login: Low. Standard OAuth flow with Socialite.
