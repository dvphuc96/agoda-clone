# GoStay Phase I — Polish, Gap Fill & Production Readiness

**Date:** 2026-06-04
**Branch:** feature/polish-and-gaps

## Problem

After Phase E-H agent implementations, several features are half-wired or unused. The app needs polish before production.

## Gap Analysis

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 1 | BookingCountdown in BookingPage | Component exists, not imported | HIGH |
| 2 | Booking expiry backend (ExpirePendingBookings command) | Migration exists, command may exist, not verified in kernel | HIGH |
| 3 | ErrorBoundary | Missing entirely | HIGH |
| 4 | SEO meta tags (react-helmet-async) | Missing | MEDIUM |
| 5 | Partner hotel CREATE | Only edit exists | MEDIUM |
| 6 | Partner dashboard charts | Stats only, no charts | MEDIUM |
| 7 | Partner booking management actions | View only | MEDIUM |
| 8 | AvailabilityCalendar integration | Component exists, unused | LOW |
| 9 | Notification badge polling | On-demand only | LOW |
| 10 | PhotoGallery cleanup | Unused duplicate component | LOW |

## Implementation Plan

### Task 1: BookingCountdown Integration
- Import `BookingCountdown` into `BookingPage.tsx`
- Show countdown after booking is created (pending status)
- Wire `expires_at` from booking response

### Task 2: Booking Expiry Backend Verification
- Check if `ExpirePendingBookings` command exists and is scheduled in `Console Kernel`
- Verify it properly cancels expired bookings and releases room inventory
- Test migration has been run

### Task 3: ErrorBoundary
- Create `frontend/src/shared/components/ErrorBoundary.tsx`
- Wrap client routes and admin routes in App.tsx
- Show friendly error UI with retry button

### Task 4: SEO Meta Tags
- Install `react-helmet-async`
- Create `useDocumentTitle` hook
- Add meta tags to key client pages (Home, Search, Hotel Detail, Booking)

### Task 5: Partner Portal Enhancements
- Add hotel CREATE to PartnerHotelsPage (modal with form)
- Add dashboard charts (recharts already installed)
- Add booking management actions (confirm/reject buttons)

### Task 6: AvailabilityCalendar Integration
- Integrate into HotelDetailPage or RoomType section
- Wire to existing `/room-types/{id}/availability-calendar` endpoint

### Task 7: Notification Badge Polling
- Add refetchInterval to notification count query in Navbar
- Badge updates every 60s

### Task 8: Cleanup
- Remove unused PhotoGallery.tsx if ImageGallery covers it
- Verify all imports are clean
