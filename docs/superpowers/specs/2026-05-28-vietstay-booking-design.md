# GoStay — Hotel & Villa Booking Platform Design

## Overview

GoStay là nền tảng đặt phòng khách sạn, villa, resort tại các điểm đến nổi tiếng ở Việt Nam. MVP tập trung vào core booking flow: search → detail → booking → payment.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Laravel | 13 |
| Frontend | React | 19.2 |
| Build Tool | Vite | 6 |
| CSS | Tailwind CSS | 4 |
| UI Components | shadcn/ui | latest |
| Server State | TanStack Query | v5 |
| Routing | React Router | 7 |
| HTTP Client | Axios | latest |
| Database | MySQL | 8 |
| Auth | Laravel Sanctum | latest |
| Payment | VNPay + MoMo SDK | latest |

## Architecture

Monolith: một repo duy nhất. Laravel serve API + React build files từ `public/`.

```
agoda-clone/
├── app/
│   ├── Http/Controllers/Api/    # API endpoints
│   ├── Models/                  # Eloquent models
│   ├── Services/                # Business logic (Payment, Booking)
│   └── Requests/                # Validation
├── database/
│   ├── migrations/              # Schema
│   └── seeders/                 # 20-30 khách sạn VN
├── frontend/                    # React 19 SPA (Vite)
│   ├── src/
│   │   ├── pages/               # Home, Search, Detail, Booking, Payment
│   │   ├── components/          # UI components (shadcn + custom)
│   │   ├── hooks/               # Custom hooks
│   │   └── api/                 # Axios API client
│   └── public/
├── routes/api.php               # API routes
└── public/                      # React build output
```

## Database Schema

### 7 bảng chính

**users**
- id BIGINT PK
- name VARCHAR(255)
- email VARCHAR(255) UNIQUE
- phone VARCHAR(20)
- password VARCHAR(255)
- avatar VARCHAR(500)
- role ENUM(user, admin)
- timestamps, soft_delete

**locations**
- id BIGINT PK
- name VARCHAR(255)
- slug VARCHAR(255) UNIQUE
- image VARCHAR(500)
- description TEXT
- region ENUM(mien_bac, mien_trung, mien_nam)
- timestamps

Seed data: Hà Nội, Đà Nẵng, Hội An, Nha Trang, Phú Quốc, Sapa, Huế, TP.HCM

**hotels**
- id BIGINT PK
- location_id FK → locations
- name VARCHAR(255)
- slug VARCHAR(255) UNIQUE
- description TEXT
- address VARCHAR(500)
- star_rating TINYINT (1-5)
- latitude DECIMAL(10,8)
- longitude DECIMAL(11,8)
- phone VARCHAR(20)
- email VARCHAR(255)
- checkin_time TIME (default 14:00)
- checkout_time TIME (default 12:00)
- amenities JSON
- status ENUM(active, inactive)
- timestamps, soft_delete

**room_types**
- id BIGINT PK
- hotel_id FK → hotels
- name VARCHAR(255)
- description TEXT
- max_guests INT
- bed_type ENUM(single, double, twin, king)
- size_sqm DECIMAL(6,2)
- price_per_night DECIMAL(12,2)
- amenities JSON
- total_rooms INT
- timestamps

**bookings**
- id BIGINT PK
- user_id FK → users
- room_type_id FK → room_types
- booking_code VARCHAR(10) UNIQUE
- check_in DATE
- check_out DATE
- guests INT
- special_requests TEXT
- total_price DECIMAL(12,2)
- status ENUM(pending, confirmed, cancelled, completed)
- timestamps, soft_delete

**payments**
- id BIGINT PK
- booking_id FK → bookings
- payment_method ENUM(vnpay, momo)
- transaction_id VARCHAR(255)
- amount DECIMAL(12,2)
- currency VARCHAR(3) DEFAULT 'VND'
- status ENUM(pending, success, failed, refunded)
- paid_at TIMESTAMP
- gateway_response JSON
- timestamps

**hotel_images**
- id BIGINT PK
- hotel_id FK → hotels
- room_type_id FK → room_types (nullable)
- image_path VARCHAR(500)
- caption VARCHAR(255)
- sort_order INT
- timestamps

### Relationships

- locations 1:N hotels
- hotels 1:N room_types
- hotels 1:N hotel_images
- room_types 1:N hotel_images
- users 1:N bookings
- room_types 1:N bookings
- bookings 1:N payments

## Pages

### 5 trang chính

1. **Home** (`/`) — Hero + search box, popular locations, featured hotels
2. **Search** (`/search`) — Hotel list với filter/sort/pagination
3. **Hotel Detail** (`/hotel/:slug`) — Gallery, info, room types, amenities
4. **Booking** (`/booking/:roomTypeId`) — Guest info, price summary, confirm
5. **Payment** (`/payment/:bookingCode`) — VNPay/MoMo selection, redirect, callback

### Trang phụ

- Login (`/login`)
- Register (`/register`)
- My Bookings (`/bookings`) — danh sách booking của user
- Booking Detail (`/bookings/:bookingCode`) — chi tiết + trạng thái thanh toán

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Đăng ký |
| POST | /api/auth/login | Đăng nhập |
| POST | /api/auth/logout | Đăng xuất |
| GET | /api/auth/me | Thông tin user hiện tại |

### Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/locations | Danh sách địa điểm |
| GET | /api/locations/{slug}/hotels | Khách sạn theo địa điểm |

### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/hotels | Search + filter + sort + pagination |
| GET | /api/hotels/{slug} | Chi tiết khách sạn |
| GET | /api/hotels/{slug}/rooms | Room types + availability |
| GET | /api/hotels/featured | Khách sạn nổi bật (home page) |

Query params cho search: `location, check_in, check_out, guests, star, price_min, price_max, sort, page`

### Bookings (require auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/bookings | Danh sách booking của user |
| POST | /api/bookings | Tạo booking mới |
| GET | /api/bookings/{bookingCode} | Chi tiết booking |
| DELETE | /api/bookings/{bookingCode} | Hủy booking |

### Payments (require auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/create | Tạo thanh toán → redirect VNPay/MoMo |
| GET | /api/payments/vnpay/callback | VNPay return URL |
| GET | /api/payments/momo/callback | MoMo return URL |
| GET | /api/payments/{id} | Chi tiết thanh toán |

## UI Design

### Color Palette (Abogo-inspired + Blue/Gold)

| Role | Color | Hex |
|------|-------|-----|
| Navbar | Navy | #1e40af |
| Primary CTA | Blue | #0066cc |
| Accent | Gold | #f59e0b |
| Logo accent | Light Gold | #fbbf24 |
| Background | White | #fbfbfd |
| Text primary | Near black | #1d1d1f |
| Text secondary | Gray | #86868b |
| Card bg | White | #ffffff |
| Tab inactive | Light gray | #f5f5f7 |
| Border | Light gray | #d2d2d7 |
| Success | Green | #059669 |
| Footer | Dark | #1d1d1f |

### Design Principles

- Clean, minimal — Abogo-inspired
- Pill-style tabs and filter chips
- Card border-radius: 16px
- Shadow nhẹ: 0 2px 12px rgba(0,0,0,0.04-0.06)
- Font weight: 700 cho title, 500 cho body, 300 cho subtitle
- Letter-spacing: -0.5px cho heading
- "Xem thêm" links: nền rgba(0,102,204,0.1) + text #0066cc

### Home Page Layout

1. **Navbar**: Logo "GoStay" (Stay màu gold), menu links, nút đăng nhập (gold bg)
2. **Hero**: Blue gradient background, tagline, search box (destination, check-in, check-out, guests, nút "Tìm kiếm" blue)
3. **Tab filter**: Tất cả / Khách sạn / Villa / Resort / Căn hộ (pill style)
4. **Địa điểm nổi bật**: 4 card grid, gradient backgrounds, tên + số lượng lưu trú
5. **Khách sạn nổi bật**: 3 card grid, ảnh, tên, địa điểm, sao, giá/đêm, nút "Đặt ngay"
6. **Footer**: Dark bg, logo, mô tả, copyright

### Search Page Layout

1. **Top bar**: Logo + search summary (location, dates, guests) + "Sửa tìm kiếm"
2. **Sidebar trái (260px)**:
   - Bộ lọc giá (range)
   - Hạng sao (pill select)
   - Loại hình (checkbox)
   - Tiện ích (tag select)
   - Nút "Áp dụng bộ lọc"
3. **Khu vực kết quả**:
   - Sort bar: Phổ biến / Giá thấp nhất / Giá cao nhất / Đánh giá
   - Hotel card: ảnh trái + info giữa (tên, địa điểm, sao, amenities, phòng trống) + giá/CTA phải (đánh giá, giá, nút "Xem phòng")
   - Pagination

## Booking Flow

1. User search → xem danh sách khách sạn
2. Click "Xem phòng" → trang Hotel Detail, chọn room type
3. Click "Đặt phòng" → trang Booking, điền thông tin khách
4. Xác nhận → tạo booking (status: pending), redirect sang Payment
5. Chọn VNPay hoặc MoMo → redirect đến gateway
6. Gateway callback → update payment status → update booking status (confirmed)
7. Hiển thị trang Booking Detail với mã booking

## Payment Integration

### VNPay
- Tạo payment URL với tham số: vnp_Amount, vnp_OrderInfo, vnp_ReturnUrl
- Redirect user đến VNPay gateway
- Callback: verify checksum, update payment record
- Sandbox testing trước khi production

### MoMo
- Tạo payment qua MoMo API
- Redirect user đến MoMo gateway
- Callback: verify signature, update payment record
- Sandbox testing trước khi production

## Seed Data

20-30 khách sạn/villa tại 8 điểm đến:

| Địa điểm | Vùng | Số khách sạn |
|----------|------|-------------|
| Hà Nội | Miền Bắc | 3 |
| Sapa | Miền Bắc | 2 |
| Huế | Miền Trung | 3 |
| Đà Nẵng | Miền Trung | 4 |
| Hội An | Miền Trung | 3 |
| Nha Trang | Miền Nam | 3 |
| TP.HCM | Miền Nam | 3 |
| Phú Quốc | Miền Nam | 4 |

Mỗi khách sạn có 2-4 room types với giá VND thực tế.

## MVP Scope

### In scope
- User register/login
- Search khách sạn với filter/sort + chọn địa điểm
- Xem chi tiết khách sạn + phòng
- Đặt phòng
- Thanh toán VNPay + MoMo
- Xem/hủy booking
- Responsive (mobile-friendly)

### Out of scope (future)
- Review/đánh giá
- Wishlist
- Admin dashboard
- Real-time availability
- Email xác nhận
- Multi-role (hotel owner)
- Analytics
