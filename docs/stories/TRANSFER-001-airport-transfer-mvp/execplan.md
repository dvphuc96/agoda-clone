# Exec Plan

## Goal

Add an MVP airport transfer module with customer quote and booking flow plus admin-managed vehicles, route prices, and booking statuses.

## Scope

In scope:

- Separate transfer backend domain.
- Customer `/transfers` search and booking request UI.
- Admin transfer management UI.
- Demo transfer seed data.
- Backend feature coverage and frontend build/React Doctor verification.

Out of scope:

- Online transfer payment.
- Driver dispatch, provider integration, map routing, and distance-based pricing.

## Risk Classification

Risk flags:

- Data model.
- Public contracts.
- Multi-domain.
- Weak proof for new domain.

Hard gates:

- New migrations and public API contract.

## Work Phases

1. Add failing backend feature tests.
2. Implement migrations, models, services, resources, controllers, and routes.
3. Add customer and admin frontend surfaces.
4. Seed demo transfer data.
5. Run backend tests, frontend build, and React Doctor.
6. Update Harness records and evidence.

## Stop Conditions

Pause for human confirmation if transfer payments, provider integration, or driver dispatch becomes required for this MVP.
