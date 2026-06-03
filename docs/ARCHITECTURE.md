# Architecture

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Laravel 13, PHP 8.3, MySQL 8.0, Sanctum auth |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| State | TanStack Query (server state), React Context (client state) |
| i18n | Custom hook-based system (`useI18n`), vi/en locales |
| Payments | VNPay, MoMo (gateway redirects + callbacks) |
| PDF | barryvdh/laravel-dompdf (invoices) |
| Infrastructure | Docker (MySQL, PHP-FPM, Node, phpMyAdmin) |
| Auth | Sanctum token-based, stored in localStorage |

## Backend Structure

```text
app/
  Http/
    Controllers/Api/          # 18 public + 19 admin controllers
      Admin/                  # Admin-only controllers
    Requests/                 # FormRequest validation
      Admin/                  # Admin-specific requests
    Resources/                # API response transformers
    Middleware/                # isAdmin middleware
  Models/                     # 22 Eloquent models
  Services/                   # 15 business logic services
  Traits/                     # Auditable trait
  Policies/                   # Laravel policies

database/
  migrations/                 # 34 migrations
  seeders/

resources/
  views/
    emails/                   # 6 Blade email templates
    invoices/                 # PDF invoice template

routes/
  api.php                     # All API routes (public + auth + admin)
```

## Frontend Structure

```text
frontend/src/
  admin/                      # Admin panel
    pages/                    # 13 feature directories + Dashboard
    components/layout/        # AdminLayout, sidebar
  client/                     # Client-facing app
    pages/                    # 16 pages
    components/               # Shared client components
  shared/                     # Shared across admin/client
    api/                      # API client modules (admin.ts, bookings.ts, etc.)
    i18n/                     # Translation types, locales (vi/en)
    contexts/                 # React contexts (auth, theme)
```

## API Architecture

- RESTful JSON API at `/api/*`
- Public routes: hotel search, locations, transfer quotes, payment callbacks
- Auth routes (`auth:sanctum`): bookings, payments, profile, reviews, wishlist, support
- Admin routes (`auth:sanctum` + `isAdmin`): CRUD management, dashboard, audit logs

## Data Flow

```text
React Page → TanStack Query → apiClient (Axios) → Laravel Controller
  → FormRequest (validation) → Service (business logic) → Model (Eloquent)
  → Resource (transform) → JSON Response

Email flow: Service → NotificationService → Mailable → Blade template
PDF flow: InvoiceService → DomPDF → Blade template → Stream response
Audit flow: Model event → Auditable trait → AuditLog::log()
```

## Key Design Decisions

1. **Services over fat controllers**: Business logic in `app/Services/`, controllers stay thin
2. **API Resources**: All responses transformed through Eloquent Resources
3. **FormRequests**: Validation at boundary, not in controllers
4. **Auditable trait**: Auto-logs admin CRUD on models with boot events
5. **Price resolution**: PriceResolutionService handles per-night pricing with overrides
6. **Bilingual client**: Client UI in vi/en via i18n, admin UI in English only
7. **Gateway pattern**: Payment gateways handle redirects, callbacks update payment status
