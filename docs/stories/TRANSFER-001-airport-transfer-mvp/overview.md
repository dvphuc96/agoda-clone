# Overview

## Current Behavior

GoStay supports hotel search, room booking, payments, refunds, notifications, and admin inventory. There is no airport transfer product surface, no transfer pricing model, and no transfer booking workflow.

## Target Behavior

Customers can search airport-hotel transfer quotes, choose a vehicle, and create a pending transfer request. Admins can manage transfer vehicle types, fixed route pricing, and transfer booking status.

## Affected Users

- Customer: searches and requests an airport transfer.
- Admin: configures vehicle and route pricing, then confirms or cancels transfer bookings.

## Affected Product Docs

- `docs/TEST_MATRIX.md`
- `docs/stories/TRANSFER-001-airport-transfer-mvp/*`

## Non-Goals

- Online payment for transfer bookings.
- Driver, vehicle plate, dispatch calendar, marketplace providers, maps, or distance-based pricing.
