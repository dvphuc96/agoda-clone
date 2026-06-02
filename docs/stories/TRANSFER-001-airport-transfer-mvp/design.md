# Design

## Domain Model

Transfers are separate from hotel room bookings. Vehicle types define passenger and luggage capacity. Routes define fixed prices for one airport, one hotel, one direction, and one vehicle type. Transfer bookings snapshot route, vehicle, airport, hotel, pickup, passenger, contact, and price details.

## Application Flow

Customers load transfer search options, query active route quotes, and create a booking from a selected quote. Bookings start as `pending`. Admins update status through `pending`, `confirmed`, `cancelled`, and `completed`.

## Interface Contract

Public API:

- `GET /api/transfers/search-options`
- `GET /api/transfers/quotes`

Authenticated customer API:

- `GET /api/transfers/bookings`
- `POST /api/transfers/bookings`
- `GET /api/transfers/bookings/{bookingCode}`
- `POST /api/transfers/bookings/{bookingCode}/cancel`

Admin API:

- `apiResource /api/admin/transfer-vehicle-types`
- `apiResource /api/admin/transfer-routes`
- `GET /api/admin/transfer-bookings`
- `GET /api/admin/transfer-bookings/{transferBooking}`
- `PATCH /api/admin/transfer-bookings/{transferBooking}/status`

## Data Model

New tables:

- `transfer_vehicle_types`
- `transfer_routes`
- `transfer_bookings`

The route table has a uniqueness constraint on hotel, vehicle type, airport code, and direction.

## UI / Platform Impact

Customer UI adds `/transfers`, navbar entry, and a transfer booking section inside My bookings. Admin UI adds `/admin/transfers` with tabs for vehicles, routes, and bookings.

## Observability

No new logging or audit table is added in the MVP. Status changes are stored on `transfer_bookings`.

## Alternatives Considered

1. Attach transfers to room bookings. Rejected because Agoda-style transfers can be booked as a separate product.
2. Inquiry-only form. Rejected because customers need visible vehicle options and fixed prices.
