# GoStay — Rate Plans & Invoices Specification

**Date:** 2026-06-03
**Status:** Approved
**Scope:** 2 features — Price Overrides (Rate Plans) + Invoice PDF Generation

---

## 1. Rate Plans — Price Overrides

### 1.1 Overview

Allow admins to override the default `price_per_night` of a room type for specific date ranges (high season, weekends, holidays, promotions). When a client searches or views rooms, the system resolves the correct price based on any active overrides for the requested dates.

### 1.2 Data Model

**New table: `price_overrides`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| room_type_id | bigint | FK → room_types.id, NOT NULL | Which room type this override applies to |
| start_date | date | NOT NULL | First night the override price applies |
| end_date | date | NOT NULL | Last night the override price applies |
| price_per_night | decimal(10,2) | NOT NULL, > 0 | Override price per night |
| label | varchar(100) | nullable | Human-readable label: "High Season", "Weekend", "Tet" |
| is_active | boolean | NOT NULL, default true | Toggle without deleting |
| created_at | timestamp | | |
| updated_at | timestamp | | |

**Indexes:**
- `idx_price_overrides_room_type_dates` on (room_type_id, start_date, end_date)
- `idx_price_overrides_active` on (room_type_id, is_active)

**Validation rules:**
- `start_date` must be ≤ `end_date`
- No overlapping date ranges for the same room_type_id (enforced in service layer)
- `price_per_night` > 0

**Price resolution logic (in HotelService or RoomTypeService):**
```
For each night in [check_in, check_out):
  1. Look for active price_override where start_date <= night <= end_date
  2. If found → use override price
  3. If not → use room_type.price_per_night (default)
```

If a booking spans multiple overrides, each night may have a different price. The booking total is the sum of per-night prices.

### 1.3 API Endpoints

**Admin endpoints (require auth:sanctum + isAdmin):**

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/room-types/{roomType}/price-overrides | List all overrides for a room type |
| POST | /api/admin/room-types/{roomType}/price-overrides | Create a new override |
| PUT | /api/admin/room-types/{roomType}/price-overrides/{id} | Update an override |
| DELETE | /api/admin/room-types/{roomType}/price-overrides/{id} | Delete an override |
| PATCH | /api/admin/room-types/{roomType}/price-overrides/{id}/toggle | Toggle is_active |

**Client-facing:** No new endpoints. Existing `GET /api/hotels/{slug}/rooms` and booking price calculation must be updated to resolve override prices.

### 1.4 Backend Implementation

**New files:**
- `app/Models/PriceOverride.php` — Eloquent model with room_type relationship
- `app/Http/Controllers/Api/Admin/PriceOverrideController.php` — CRUD controller
- `app/Http/Requests/Admin/StorePriceOverrideRequest.php` — Validation (dates, overlap check, price > 0)
- `app/Http/Requests/Admin/UpdatePriceOverrideRequest.php` — Validation
- `app/Http/Resources/PriceOverrideResource.php` — JSON response resource
- `database/migrations/YYYY_MM_DD_create_price_overrides_table.php`

**Modified files:**
- `app/Services/RoomTypeService.php` (or wherever room availability/price is resolved) — Add price resolution logic that checks overrides
- `app/Http/Resources/RoomTypeResource.php` — Include effective price for requested dates
- `routes/api.php` — Add admin price override routes

### 1.5 Frontend — Admin

**New page:** `frontend/src/admin/pages/price-overrides/PriceOverrideListPage.tsx`

- Accessible from admin room type detail or as a sub-page under room types
- Table columns: Label, Start Date, End Date, Price/Night, Status (active/inactive), Actions (edit, delete, toggle)
- Create/Edit form: date range picker, price input, label text, active toggle
- Uses existing admin page patterns (data table, form modal or inline form)

**Modified files:**
- `frontend/src/App.tsx` — Add admin route for price overrides
- `frontend/src/admin/pages/adminUtils.tsx` — Add sidebar link if applicable

### 1.6 Frontend — Client

No new client pages. The following existing components must be updated to display resolved prices:

- `SearchResults` — Price shown in search result cards must reflect overrides
- `HotelDetailPage` / room list — Room prices must reflect overrides for selected dates
- `BookingPage` — Price breakdown must show per-night prices (may vary if booking spans seasons)
- `PriceSummary` — If prices vary across nights, show breakdown per night range

**API contract change:** The `GET /api/hotels/{slug}/rooms` response should include `effective_price` (or `price_per_night` resolved with overrides) when `check_in` and `check_out` query params are provided.

### 1.7 i18n Additions

```typescript
ratePlans: {
  title: string;
  subtitle: string;
  label: string;
  startDate: string;
  endDate: string;
  pricePerNight: string;
  status: string;
  active: string;
  inactive: string;
  create: string;
  edit: string;
  delete: string;
  deleteConfirm: string;
  noOverrides: string;
  createSuccess: string;
  updateSuccess: string;
  deleteSuccess: string;
  overlapError: string;
  dateRangeError: string;
  priceRequired: string;
  seasonalPrice: string;
  defaultPrice: string;
};
```

---

## 2. Invoices & Receipts (PDF Generation)

### 2.1 Overview

Generate professional PDF invoices for paid bookings. Users can download from booking detail page. Admins can download from admin booking detail. Uses DomPDF on the backend.

### 2.2 Data Source

No new database tables. Invoice data is assembled from:

- `bookings` — booking_code, user_id, hotel_id, room_type_id, check_in, check_out, total_price, status, created_at
- `room_types` — name
- `hotels` — name, address
- `payments` — amount, method, status, paid_at
- `users` — name, email

**Eligibility:** Invoice is available only when booking has a payment with status `paid` (or booking status is `confirmed`/`completed`).

### 2.3 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/bookings/{bookingCode}/invoice | auth:sanctum (owner) | Download PDF invoice |
| GET | /api/admin/bookings/{booking}/invoice | auth:sanctum + isAdmin | Download PDF invoice (admin) |

**Response:** Binary PDF file (`Content-Type: application/pdf`, `Content-Disposition: attachment; filename="invoice-{bookingCode}.pdf"`)

**Error responses:**
- 403 — Not the booking owner (client endpoint)
- 404 — Booking not found
- 422 — Booking not eligible for invoice (not paid)

### 2.4 Backend Implementation

**Dependencies:**
- `barryvdh/laravel-dompdf` — Laravel DomPDF wrapper

**New files:**
- `app/Services/InvoiceService.php` — Assembles invoice data, generates PDF
- `app/Http/Controllers/Api/InvoiceController.php` — Client invoice download
- `app/Http/Controllers/Api/Admin/InvoiceController.php` — Admin invoice download
- `resources/views/invoices/booking.blade.php` — Blade template for PDF

**Modified files:**
- `routes/api.php` — Add invoice routes
- `composer.json` — Add barryvdh/laravel-dompdf dependency

### 2.5 Invoice Template

The Blade template (`resources/views/invoices/booking.blade.php`) renders a professional A4 invoice:

```
┌──────────────────────────────────────────┐
│  [GoStay Logo/Brand]    INVOICE          │
│  GoStay Travel Co., Ltd                  │
│  Invoice #: {booking_code}               │
│  Date: {paid_at}                         │
├──────────────────────────────────────────┤
│  Bill To:                                │
│  {user_name}                             │
│  {user_email}                            │
├──────────────────────────────────────────┤
│  Booking Details                         │
│  Hotel: {hotel_name}                     │
│  Room: {room_type_name}                  │
│  Check-in: {check_in}                    │
│  Check-out: {check_out}                  │
│  Nights: {nights}                        │
├──────────────────────────────────────────┤
│  Description       | Qty | Unit | Amount │
│  Room accommodation| {n} | /ngt | {sub}  │
│  Taxes & fees      |     |      | {tax}  │
│  ─────────────────────────────────────── │
│  TOTAL              |            | {total}│
├──────────────────────────────────────────┤
│  Payment: {method} on {paid_at}          │
│                                          │
│  Thank you for booking with GoStay.      │
│  support@gostay.vn | 1900 6868          │
└──────────────────────────────────────────┘
```

### 2.6 Frontend — Client

**Modified:** `BookingDetailPage.tsx`
- Add "Download Invoice" button (Download icon) visible when booking is paid/confirmed/completed
- Button triggers `GET /api/bookings/{bookingCode}/invoice` and downloads the PDF
- Use `fetch` with auth header → blob → createObjectURL → download

**Modified:** `BookingDetailPage.tsx` celebration section
- Add invoice download link alongside "Continue searching" CTA

### 2.7 Frontend — Admin

**Modified:** Admin booking detail page
- Add "Download Invoice" button in booking detail view

### 2.8 i18n Additions

```typescript
invoice: {
  title: string;
  invoiceNumber: string;
  billTo: string;
  bookingDetails: string;
  pricePerNight: string;
  nights: string;
  subtotal: string;
  taxes: string;
  total: string;
  paymentInfo: string;
  paymentMethod: string;
  paidAt: string;
  download: string;
  notEligible: string;
  notEligibleTitle: string;
};
```

---

## 3. Implementation Order

### Phase 1: Rate Plans (Backend) — Foundation
1. Migration + Model for price_overrides
2. Admin CRUD controller + requests + resource
3. Routes
4. Price resolution logic in room type service

### Phase 2: Rate Plans (Frontend) — Admin UI
5. Admin price override list page
6. Route + sidebar integration

### Phase 3: Rate Plans (Frontend) — Client Integration
7. Update API to return resolved prices
8. Update search results, hotel detail, booking page to show resolved prices

### Phase 4: Invoices (Backend)
9. Install DomPDF
10. InvoiceService + Blade template
11. Client + Admin invoice controllers
12. Routes

### Phase 5: Invoices (Frontend)
13. Download invoice button on BookingDetailPage
14. Download invoice button on Admin booking detail

---

## 4. Testing Notes

- Rate Plans: Test price resolution with no overrides, single override, overlapping date check, multi-night booking spanning seasons
- Invoices: Test eligible (paid) vs ineligible (pending) bookings, PDF renders correctly, correct amounts, download works
