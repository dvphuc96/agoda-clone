# GoStay Feature Roadmap Spec — 8-Week Plan

## Context

GoStay (Agoda clone) đã có 43+ features production-ready. Roadmap này bổ sung 15 features trong 4 phases, tập trung balanced vào production readiness, user engagement, monetization, và platform advancement.

**Tech Stack**: Laravel 13 + PHP 8.3 + MySQL 8.0 + Sanctum | React 19 + TypeScript + Vite 8 + Tailwind 4 + TanStack Query

---

## Phase 1: Production Hardening (Weeks 1-2)

### 1.1 Email Verification [S]

**Why**: Prevent throwaway accounts, reduce booking fraud, ensure notifications reach real inboxes.

**Implementation**:
- Uncomment `Illuminate\Contracts\Auth\MustVerifyEmail` on `User.php`
- Create `EmailVerificationController` with `verify`, `resend`, `notice` methods
- Add `verified` middleware to booking/payment/review routes
- Frontend: `VerifyEmailPage.tsx` with resend button
- Chain `VerifyEmailNotification` after registration

**Files**: `User.php`, `AuthController.php`, `routes/api.php`, new `EmailVerificationController.php`, new `VerifyEmailPage.tsx`

### 1.2 Redis Caching Layer [M]

**Why**: Current `database` cache driver negates caching benefits. Redis is foundational for rate limiting, real-time notifications, and search.

**Implementation**:
- Add Redis to `docker-compose.yml`
- Install `predis/predis`, update env vars
- Cache targets: hotel search (5min, key by location/sort/filters), featured (15min), hotel detail (10min, tag-based invalidation), locations (30min)
- Create `CacheService` for centralized key generation and tag management
- Invalidate on admin/partner hotel updates

**Files**: `docker-compose.yml`, `config/cache.php`, `config/database.php`, `HotelController.php`, new `CacheService.php`

### 1.3 API Rate Limiting [S]

**Why**: All API routes unprotected against abuse. Production security requirement.

**Implementation**:
- `throttle:60,1` for authenticated routes
- `throttle:20,1` for auth endpoints (login, register, forgot-password)
- `throttle:30,1` for public search
- `throttle:10,1` for payment creation
- Configure in `AppServiceProvider`

**Dependencies**: 1.2 (Redis for performant rate limiting)

**Files**: `routes/api.php`, `AppServiceProvider.php`

### 1.4 SEO Meta Tags + Sitemap [M]

**Why**: SPA with no SSR = search engines see empty shell. Organic traffic is primary OTA acquisition channel.

**Implementation**:
- Install `react-helmet-async`, create `useSeo` hook
- Apply to HomePage, SearchPage, HotelDetailPage with JSON-LD Hotel schema
- Backend: `SitemapController` generating XML from active hotels + locations (cached 24h)
- Add `GET /sitemap.xml` and `robots.txt` endpoints

**Dependencies**: 1.2 (sitemap cached with Redis)

**Files**: `frontend/package.json`, `HotelDetailPage.tsx`, `SearchPage.tsx`, `HomePage.tsx`, new `SitemapController.php`, new `useSeo.ts`

---

## Phase 2: Trust & Engagement (Weeks 3-4)

### 2.1 Photo Reviews + Owner Responses [M]

**Why**: Photo reviews significantly more convincing. Owner responses are trust signal for both hotels and guests.

**Implementation**:
- Migration: `review_images` JSON column, `owner_response_text`, `owner_responded_at` on reviews
- Update `StoreReviewRequest` for image uploads (max 5, 2MB each)
- Store images via Laravel filesystem, return URLs in `ReviewResource`
- Partner route: `POST /partner/reviews/{review}/respond`
- Frontend: drag-drop image upload, photo gallery in review list, owner response badge

**Files**: `Review.php`, `StoreReviewRequest.php`, `ReviewResource.php`, `ReviewService.php`, new migration, `reviews.ts`

### 2.2 Real-Time Notifications [L]

**Why**: 60s polling creates unnecessary DB load and poor UX. Booking confirmations should appear instantly.

**Implementation**:
- Install `laravel/echo` + `pusher-js` (or Soketi self-hosted in Docker)
- Configure `broadcasting.php`
- Broadcasting events: `booking_confirmed`, `booking_cancelled`, `refund_approved`, `cancellation_requested`
- Private channel `private-user.{id}`
- Frontend: Initialize Echo in App.tsx, event-driven query invalidation
- Fallback: keep 5min refetchInterval

**Dependencies**: 1.2 (Redis for broadcasting pub/sub)

**Files**: `broadcasting.php` (new), `NotificationService.php`, `App.tsx`, `NotificationDropdown.tsx`, `docker-compose.yml`

### 2.3 Hotel Comparison [M]

**Why**: Users open multiple tabs to compare. Unified comparison view reduces decision friction and increases conversion.

**Implementation**:
- Backend: `GET /hotels/compare?slugs=slug1,slug2,slug3` returning hotels with rooms, amenities, policies, review summary
- Frontend: `ComparePage.tsx` with 2-3 column side-by-side grid
- Compare button on hotel cards, store IDs in URL params
- Compare: name, stars, price range, amenities (check/cross grid), location, reviews, room types

**Files**: `routes/api.php`, `HotelController.php`, new `ComparePage.tsx`, `SearchPage.tsx`, `WishlistPage.tsx`

### 2.4 Booking Reminders [S]

**Why**: Users forget trip details. Reminders reduce no-shows and improve satisfaction.

**Implementation**:
- Artisan command `SendBookingReminders` (daily at 8am)
- Query confirmed bookings with check_in tomorrow, not yet reminded
- Add `reminder_sent_at` to bookings table
- Notification type `booking_reminder` via existing NotificationService

**Files**: `routes/console.php`, `NotificationService.php`, new `SendBookingReminders.php`, new migration

---

## Phase 3: Monetization (Weeks 5-6)

### 3.1 Multi-Currency Support [L]

**Why**: International tourists to Vietnam need USD/EUR/KRW. Expands addressable market.

**Implementation**:
- `currencies` table: code, symbol, exchange_rate (VND base), decimal_places, is_active
- `CurrencyService`: fetch + cache exchange rates (Redis 6h), convert amounts
- `preferred_currency` on users table
- `CurrencyMiddleware`: `?currency=USD` query param
- Modify `HotelResource`, `RoomTypeResource`, `BookingResource` for conditional conversion
- Payment: VNPay supports multi-currency; MoMo VND-only (display approximate for non-VND)
- Frontend: `CurrencySelector` in header, `useCurrency` hook for formatting

**Dependencies**: 1.2 (Redis for exchange rate caching)

**Files**: new `CurrencyService.php`, new migration, `HotelResource.php`, `RoomTypeResource.php`, `BookingResource.php`, `PaymentService.php`, new `CurrencySelector.tsx`, new `useCurrency.ts`

### 3.2 Loyalty Points System [L]

**Why**: Points create retention flywheel: book more, earn more, book again cheaper.

**Implementation**:
- `loyalty_accounts` table: user_id, points_balance, lifetime_points, tier, tier_updated_at
- `loyalty_transactions` table: account_id, type(earn/redeem/expire), points, booking_id, description
- `LoyaltyService`: earnPoints(Booking), redeemPoints(User, int), calculateTier(User)
- Tiers: Bronze(0), Silver(1K), Gold(5K), Platinum(20K) lifetime points
- Earning: 1 point / 10K VND, tier multipliers (1x, 1.2x, 1.5x, 2x)
- Points awarded 7 days after checkout (prevent gaming)
- Redemption: 1 point = 1K VND, applied during booking alongside coupons
- Frontend: `LoyaltyPage.tsx`, tier badge in header, "Use Points" toggle in booking

**Dependencies**: 3.1 (points display in preferred currency)

**Files**: new `LoyaltyService.php`, new `LoyaltyController.php`, new migrations, `User.php`, `BookingService.php`, `BookingResource.php`, new `LoyaltyPage.tsx`

### 3.3 Partner Revenue Analytics [M]

**Why**: Partners need revenue insights to make pricing decisions. Increases partner engagement.

**Implementation**:
- Extend `PartnerDashboardController`: revenue-chart, occupancy, booking-sources, top-room-types, reviews-summary
- `PartnerAnalyticsService` scoped to `$user->ownedHotels()`
- Revenue: daily/weekly/monthly with previous period comparison
- Occupancy: room nights booked vs available
- Frontend: charts with recharts on partner dashboard

**Files**: `PartnerDashboardController.php`, new `PartnerAnalyticsService.php`, new/extended partner dashboard page

---

## Phase 4: Advanced Platform (Weeks 7-8)

### 4.1 Elasticsearch Search [XL]

**Why**: MySQL LIKE queries lack fuzzy matching, typo tolerance, relevance ranking. Single highest-impact UX upgrade.

**Implementation**:
- Elasticsearch in docker-compose
- Install `laravel/scout` or `elastic/elasticsearch-php`
- `HotelSearchIndex`: name(ngram), description, amenities, geo_point, price_range, avg_rating
- `SearchService`: fulltext, filters, geolocation sort, relevance scoring
- Autocomplete: `GET /search/suggest?q=partial`
- Model events (`saved`, `deleted`) sync index
- Replace `HotelController::index` queries with SearchService

**Dependencies**: 1.2 (Redis for search result caching)

**Files**: `docker-compose.yml`, `HotelController.php`, `Hotel.php`, new `SearchService.php`, new migration/config

### 4.2 RBAC with Spatie Permissions [M]

**Why**: Flat middleware can't express granular permissions. Needed before real admin staff onboarding.

**Implementation**:
- Install `spatie/laravel-permission`
- Roles: super_admin, admin, content_manager, support_agent, partner, user
- Permissions: bookings.view/manage, hotels.view/manage, payments.view/refund, analytics.view, users.manage, reviews.moderate, support.manage
- Replace `IsAdmin`/`IsHotelOwner` middleware with Spatie
- Migrate existing `role` column to Spatie roles

**Files**: `IsAdmin.php`, `IsHotelOwner.php`, `routes/api.php`, `User.php`, `composer.json`

### 4.3 Price Alerts [M]

**Why**: Capture high-intent users not ready to book. Drives repeat engagement.

**Implementation**:
- `price_alerts` table: user_id, hotel_id, room_type_id(nullable), target_price, is_active, last_notified_at
- `PriceAlertController`: CRUD + toggle
- Artisan command `CheckPriceAlerts` (hourly) using `PriceResolutionService`
- Notify when room price drops below target

**Dependencies**: 2.2 (real-time notifications for instant alerts)

**Files**: new `PriceAlertController.php`, new `CheckPriceAlerts.php`, new migration, `HotelDetailPage.tsx`, `ProfilePage.tsx`

### 4.4 Backend Recently Viewed [S]

**Why**: localStorage-only history lost on device switch. Backend enables cross-device sync and recommendations.

**Implementation**:
- `recently_viewed_hotels` table: user_id, hotel_id, viewed_at (unique on user+hotel, upsert)
- `RecentlyViewedService`: dedup, limit 50, sync
- Keep localStorage as offline cache, sync when logged in
- Show on homepage and search sidebar

**Files**: new `RecentlyViewController.php`, new `RecentlyViewedService.php`, new migration, `useRecentlyViewed.ts`, `HomePage.tsx`

---

## Implementation Order

```
Wave 1 (parallel): 1.1 Email Verification + 1.2 Redis + 1.4 SEO
Wave 2 (after 1.2): 1.3 Rate Limiting
Wave 3 (parallel): 2.1 Photo Reviews + 2.3 Comparison + 2.4 Reminders
Wave 4 (after 1.2): 2.2 Real-Time Notifications
Wave 5 (parallel): 3.3 Partner Analytics + 3.1 Multi-Currency
Wave 6 (after 3.1): 3.2 Loyalty Points
Wave 7 (parallel): 4.2 RBAC + 4.4 Recently Viewed + 4.1 Elasticsearch
Wave 8 (after 2.2): 4.3 Price Alerts
```

## Effort: 202-272h total (~5-7 weeks @ 40h/week)

## Verification
- Phase 1: email flow E2E, cache hit rates >80%, rate limit 429 responses, Google Search Console indexing
- Phase 2: image upload/display, WebSocket connection stability, comparison rendering, reminder delivery at 8am
- Phase 3: currency conversion accuracy ±0.5%, points calculation, partner chart data correctness
- Phase 4: search relevance testing, permission matrix validation, alert trigger timing, cross-device history sync
