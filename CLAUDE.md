# GoStay — Agoda Clone Project

## Tech Stack
- **Backend**: Laravel 13 + PHP 8.3 + MySQL 8.0 + Sanctum
- **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + TanStack Query
- **Docker**: Full stack (MySQL, PHP-FPM, Node, phpMyAdmin)

## Project Structure
- `frontend/src/admin/` — Admin panel pages & components
- `frontend/src/client/` — Client-facing pages & components
- `frontend/src/shared/` — Shared API clients, i18n, contexts, types
- `app/Http/Controllers/Api/` — User API controllers
- `app/Http/Controllers/Api/Admin/` — Admin API controllers
- `app/Services/` — Business logic services
- `app/Http/Resources/` — API response resources
- `database/migrations/` — Database schema

## Rules
- Whenever writing React code, use react-doctor skill to check and fix issues.
- Admin UI: English. Client UI: bilingual (vi/en) via i18n.
- API responses use Resources, validation uses FormRequests, business logic uses Services.

## Harness: GoStay Team

**Goal:** Coordinate frontend-dev, backend-dev, and QA agents for milestone delivery.

**Trigger:** GoStay-related development work (features, bugs, milestones) → use `gostay-orchestrator` skill (or `gostay-pm`). Simple questions can be answered directly.

**Agents:**
- `frontend-dev` — React/TypeScript in `frontend/src/`
- `backend-dev` — Laravel/PHP in `app/`, `routes/`, `database/`
- `qa` — Code review, testing, API contract validation

**Change History:**
| Date | Change | Target | Reason |
|------|--------|--------|--------|
| 2026-06-01 | Initial harness setup | All agents + skills | User requested team setup |
| 2026-06-01 | Integrated 4 design skills into frontend-dev | gostay-frontend-dev skill + frontend-dev agent | User added taste, soft, redesign, stitch skills for premium UI |
