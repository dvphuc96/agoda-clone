# GoStay — Admin Dashboard Design

## Overview

Admin dashboard for GoStay — manage locations, hotels, rooms, bookings, payments, and users. Shares the same Laravel backend, with admin pages inside the same React frontend at `/admin/*`.

## Architecture

Admin panel lives inside the same `frontend/` project, separated by routes and lazy loading.

```
frontend/src/
├── client/           # Trang user (Home, Search, Hotel, Booking...)
│   ├── pages/
│   ├── components/
│   └── layouts/
├── admin/            # Trang admin (Dashboard, Locations, Hotels...)
│   ├── pages/
│   ├── components/
│   └── layouts/
├── shared/           # Dùng chung (api, hooks, types, components)
│   ├── api/
│   ├── hooks/
│   ├── types/
│   └── components/
└── App.tsx           # Router phân tuyến /admin/*
```

Reasons:
- 1 project, 1 build, 1 Docker container
- Share API client, types, auth logic, UI components
- React Router lazy-load admin pages → user không tải code admin
- Không duplicate code như khi tách 2 project riêng

## Access Control

- Users table has `role` ENUM(user, admin)
- Middleware `isAdmin` checks `$user->role === 'admin'`
- All admin API routes under middleware group: `auth:sanctum` + `isAdmin`

## Admin Pages

### 1. Dashboard (`/admin`)
**Stats overview:**
- Total bookings today / this week / this month
- Revenue today / this week / this month (VND)
- Active hotels count
- New user registrations
- Bookings by status (pending, confirmed, cancelled, completed) — pie chart
- Revenue for last 7 days — line chart

### 2. Locations (`/admin/locations`)
- Table listing: name, slug, region, hotel count, actions
- Create / Edit / Delete locations
- Upload location image

### 3. Hotels (`/admin/hotels`)
- Table listing: name, location, star rating, status, price from, actions
- Filter: by location, star rating, status
- Create / Edit / Delete hotels
- Upload hotel images (multiple)
- Toggle active/inactive

### 4. Room Types (`/admin/hotels/:id/rooms`)
- Room types list per hotel
- Create / Edit / Delete room types
- Upload room images (multiple)

### 5. Bookings (`/admin/bookings`)
- Table listing: booking code, user, hotel, room, check-in, check-out, total, status
- Filter: by status, date range, hotel
- View booking detail
- Update status (confirm, complete, cancel)
- Export CSV

### 6. Payments (`/admin/payments`)
- Table listing: booking code, method, amount, status, paid at
- Filter: by method, status, date range
- View payment detail (gateway response)

### 7. Users (`/admin/users`)
- Table listing: name, email, phone, role, registered at, booking count
- View user detail + booking history
- Change role (user ↔ admin)
- Enable/disable account

## Database Changes

### Add column to users:
```sql
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER role;
```

## Admin API Endpoints

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard/stats | Overview statistics |
| GET | /api/admin/dashboard/revenue-chart | 7-day revenue data |
| GET | /api/admin/dashboard/booking-status | Bookings by status |

### Locations (CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/locations | List (paginated) |
| POST | /api/admin/locations | Create |
| GET | /api/admin/locations/{id} | Show |
| PUT | /api/admin/locations/{id} | Update |
| DELETE | /api/admin/locations/{id} | Delete |
| POST | /api/admin/locations/{id}/image | Upload image |

### Hotels (CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/hotels | List (filter, sort, paginate) |
| POST | /api/admin/hotels | Create |
| GET | /api/admin/hotels/{id} | Show + rooms + images |
| PUT | /api/admin/hotels/{id} | Update |
| DELETE | /api/admin/hotels/{id} | Delete |
| PATCH | /api/admin/hotels/{id}/toggle-status | Active/Inactive |
| POST | /api/admin/hotels/{id}/images | Upload images (multiple) |
| DELETE | /api/admin/hotels/images/{id} | Delete image |

### Room Types (CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/hotels/{hotelId}/room-types | List room types |
| POST | /api/admin/hotels/{hotelId}/room-types | Create |
| GET | /api/admin/room-types/{id} | Show |
| PUT | /api/admin/room-types/{id} | Update |
| DELETE | /api/admin/room-types/{id} | Delete |
| POST | /api/admin/room-types/{id}/images | Upload images (multiple) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/bookings | List (filter, sort, paginate) |
| GET | /api/admin/bookings/{id} | Show detail |
| PATCH | /api/admin/bookings/{id}/status | Update status |
| GET | /api/admin/bookings/export | Export CSV |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/payments | List (filter, paginate) |
| GET | /api/admin/payments/{id} | Show detail |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | List (filter, paginate) |
| GET | /api/admin/users/{id} | Show + bookings |
| PATCH | /api/admin/users/{id}/role | Change role |
| PATCH | /api/admin/users/{id}/toggle-active | Enable/disable |

## Admin Frontend

### Tech Stack (shared with client)
- React 19 + Vite 6 (same `frontend/` project)
- Tailwind CSS 4 + shadcn/ui
- TanStack Table v8 (data tables — sort, filter, pagination)
- TanStack Query v5 (data fetching)
- Recharts (dashboard charts)
- React Router 7 (lazy-loaded admin routes)
- Axios (shared API client)

### UI Design

**Layout:**
- **Left sidebar (240px)**: Logo "GoStay Admin", navigation menu, user info
- **Top bar**: Breadcrumb, search, notifications, user avatar
- **Content area**: Data tables, forms, stats cards

**Color palette:** Same as user-facing
- Sidebar: Navy #1e40af
- Primary: #0066cc
- Accent: #f59e0b
- Background: #fbfbfd
- Text: #1d1d1f

**Sidebar menu:**
```
Dashboard
Locations
Hotels
Room Types
Bookings
Payments
Users
```

**Data tables:**
- TanStack Table with sort, filter, pagination
- Row actions: View, Edit, Delete (dropdown menu)
- Responsive: horizontal scroll on mobile

**Forms:**
- shadcn/ui Form components
- Inline validation
- Image upload with preview
- Select dropdowns for locations, room types

### File Structure (inside frontend/)
```
frontend/src/
├── admin/
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── locations/
│   │   │   ├── LocationListPage.tsx
│   │   │   └── LocationFormPage.tsx
│   │   ├── hotels/
│   │   │   ├── HotelListPage.tsx
│   │   │   ├── HotelFormPage.tsx
│   │   │   └── RoomTypeFormPage.tsx
│   │   ├── bookings/
│   │   │   ├── BookingListPage.tsx
│   │   │   └── BookingDetailPage.tsx
│   │   ├── payments/
│   │   │   ├── PaymentListPage.tsx
│   │   │   └── PaymentDetailPage.tsx
│   │   └── users/
│   │       ├── UserListPage.tsx
│   │       └── UserDetailPage.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── DataTable.tsx (reusable table)
│   │   ├── StatsCard.tsx
│   │   └── ImageUpload.tsx
│   └── hooks/
│       └── useAdminAuth.ts
├── client/                    # Existing user-facing pages
│   ├── pages/
│   ├── components/
│   └── layouts/
└── shared/
    ├── api/
    │   └── admin.ts
    ├── hooks/
    ├── types/
    └── components/
        └── ui/ (shadcn)
```

## MVP Scope

### In scope
- Dashboard with stats + charts
- CRUD Locations
- CRUD Hotels + images
- CRUD Room Types + images
- List + detail bookings, update status
- List + detail payments
- List users, change role, enable/disable
- Export CSV bookings
- Admin middleware (role check)

### Out of scope (future)
- Real-time notifications
- Audit log
- Voucher/promotion management
- Detailed revenue reports
- Multi-admin permissions
- Custom date range dashboard filters
