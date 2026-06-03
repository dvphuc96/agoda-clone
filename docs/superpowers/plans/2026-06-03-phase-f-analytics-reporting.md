# Implementation Plan: Phase F — Analytics & Revenue Reporting

## Overview

Thêm analytics dashboard chi tiết cho admin: revenue over time, occupancy rates, conversion funnel, top hotels. CSV export.

## Steps

### Step 1: Analytics Service

**File**: `app/Services/AnalyticsService.php` (new)

Methods:
- `revenueOverTime($startDate, $endDate, $groupBy = 'day')` — aggregate payments by date.
- `occupancyRate($hotelId, $startDate, $endDate)` — booked rooms / total rooms per day.
- `conversionFunnel($startDate, $endDate)` — searches, detail views, bookings, payments count.
- `topHotels($limit = 10, $startDate, $endDate)` — hotels by revenue and booking count.
- `exportRevenueCsv($startDate, $endDate)` — generate CSV file.

### Step 2: Admin Analytics Controller

**File**: `app/Http/Controllers/Api/Admin/AnalyticsController.php` (new)

Endpoints:
- `GET /admin/analytics/revenue` — params: start_date, end_date, group_by (day/month), location_id, hotel_id.
- `GET /admin/analytics/occupancy` — params: start_date, end_date, hotel_id, room_type_id.
- `GET /admin/analytics/top-hotels` — params: start_date, end_date, limit.
- `GET /admin/analytics/export` — params: start_date, end_date, format (csv).

### Step 3: Analytics Resources

**Files**: (new)
- `app/Http/Resources/RevenuePointResource.php` — date, revenue, booking_count.
- `app/Http/Resources/OccupancyDataResource.php` — date, total_rooms, booked_rooms, rate.
- `app/Http/Resources/TopHotelResource.php` — hotel, revenue, bookings, avg_rating.

### Step 4: Routes

**File**: `routes/api.php`

Add under admin group:
```
Route::get('/analytics/revenue', [AdminAnalyticsController::class, 'revenue']);
Route::get('/analytics/occupancy', [AdminAnalyticsController::class, 'occupancy']);
Route::get('/analytics/top-hotels', [AdminAnalyticsController::class, 'topHotels']);
Route::get('/analytics/export', [AdminAnalyticsController::class, 'export']);
```

### Step 5: Frontend API types

**File**: `frontend/src/shared/api/admin.ts` — add analytics methods to `adminApi`.

Types:
```typescript
interface RevenuePoint { date: string; revenue: number; booking_count: number; }
interface OccupancyData { date: string; total_rooms: number; booked_rooms: number; rate: number; }
interface TopHotel { hotel: { id: number; name: string }; revenue: number; bookings: number; avg_rating: number; }
```

### Step 6: Admin Analytics Page

**File**: `frontend/src/admin/pages/analytics/AnalyticsPage.tsx` (new)

Layout:
- Date range picker (preset: 7d, 30d, 90d, custom).
- Location/hotel filter dropdowns.
- Tabs: Revenue | Occupancy | Top Hotels.
- Revenue tab: line chart (revenue over time) + summary cards (total revenue, avg per day, total bookings).
- Occupancy tab: bar chart (occupancy rate by hotel) + date range view.
- Top Hotels tab: table with hotel name, revenue, bookings, avg rating.
- Export CSV button.

### Step 7: Chart components

**Files**: (new)
- `frontend/src/admin/components/charts/RevenueChart.tsx` — line chart using recharts or chart.js.
- `frontend/src/admin/components/charts/OccupancyChart.tsx` — bar chart.
- `frontend/src/admin/components/charts/DateRangePicker.tsx` — preset + custom date range.

Note: Check if chart library already exists. If not, install `recharts` (lightweight, React-native).

### Step 8: Admin sidebar update

**File**: `frontend/src/admin/components/layout/AdminLayout.tsx`

- Add "Analytics" sidebar item with BarChart3 icon.

### Step 9: App routes

**File**: `frontend/src/App.tsx`

- Add lazy route for AnalyticsPage.

### Step 10: i18n keys

**Files**: `types.ts`, `vi.ts`, `en.ts`

Add `analytics` section:
- title, subtitle, revenue, occupancy, topHotels, export, dateRange, last7d, last30d, last90d, custom, totalRevenue, avgPerDay, totalBookings, occupancyRate, exportCsv.

## Files Changed

| File | Action |
| --- | --- |
| app/Services/AnalyticsService.php | new |
| app/Http/Controllers/Api/Admin/AnalyticsController.php | new |
| app/Http/Resources/RevenuePointResource.php | new |
| app/Http/Resources/OccupancyDataResource.php | new |
| app/Http/Resources/TopHotelResource.php | new |
| routes/api.php | modify |
| frontend/src/shared/api/admin.ts | modify |
| frontend/src/admin/pages/analytics/AnalyticsPage.tsx | new |
| frontend/src/admin/components/charts/RevenueChart.tsx | new |
| frontend/src/admin/components/charts/OccupancyChart.tsx | new |
| frontend/src/admin/components/charts/DateRangePicker.tsx | new |
| frontend/src/admin/components/layout/AdminLayout.tsx | modify |
| frontend/src/App.tsx | modify |
| frontend/src/shared/i18n/types.ts | modify |
| frontend/src/shared/i18n/locales/vi.ts | modify |
| frontend/src/shared/i18n/locales/en.ts | modify |

## Dependencies

- Chart library: `recharts` (npm install).

## Risk

Medium. Analytics queries may be slow on large datasets. Add database indexes on bookings/payments date columns. Use query caching for dashboard.
