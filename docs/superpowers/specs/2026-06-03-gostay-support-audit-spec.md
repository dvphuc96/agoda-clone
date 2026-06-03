# GoStay — Support Tickets & Audit Logging Specification

**Date:** 2026-06-03
**Status:** Approved
**Scope:** 2 features — Support Ticket System + Admin Audit Logging

---

## 1. Support Ticket System

### 1.1 Overview

Allow users to submit support requests (booking issues, payment problems, general questions). Admins view, respond to, and resolve tickets through the admin panel.

### 1.2 Data Model

**New table: `support_tickets`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| user_id | bigint | FK → users.id, NOT NULL | Ticket creator |
| booking_code | varchar(20) | nullable | Related booking (optional) |
| subject | varchar(200) | NOT NULL | Ticket subject |
| category | enum | NOT NULL | booking, payment, hotel, transfer, other |
| status | enum | NOT NULL, default open | open, in_progress, resolved, closed |
| priority | enum | NOT NULL, default normal | low, normal, high, urgent |
| created_at | timestamp | | |
| updated_at | timestamp | | |

**New table: `ticket_messages`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| ticket_id | bigint | FK → support_tickets.id, NOT NULL | Parent ticket |
| user_id | bigint | FK → users.id, NOT NULL | Message sender |
| is_admin | boolean | NOT NULL, default false | Whether sender is admin |
| message | text | NOT NULL | Message content |
| created_at | timestamp | | |
| updated_at | timestamp | | |

**Indexes:**
- `idx_tickets_user` on (user_id, status)
- `idx_tickets_status` on (status, category)
- `idx_messages_ticket` on (ticket_id, created_at)

### 1.3 API Endpoints

**Client (auth:sanctum):**

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/support/tickets | List user's tickets |
| POST | /api/support/tickets | Create ticket |
| GET | /api/support/tickets/{id} | View ticket + messages |
| POST | /api/support/tickets/{id}/messages | Add message |

**Admin (auth:sanctum + isAdmin):**

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/support/tickets | List all tickets (filter by status/category) |
| GET | /api/admin/support/tickets/{id} | View ticket detail + messages |
| POST | /api/admin/support/tickets/{id}/messages | Admin reply |
| PATCH | /api/admin/support/tickets/{id}/status | Update status/priority |

### 1.4 Backend Files

- `app/Models/SupportTicket.php`
- `app/Models/TicketMessage.php`
- `app/Http/Controllers/Api/SupportTicketController.php`
- `app/Http/Controllers/Api/Admin/SupportTicketController.php`
- `app/Http/Requests/StoreTicketRequest.php`
- `app/Http/Requests/StoreTicketMessageRequest.php`
- `app/Http/Resources/SupportTicketResource.php`
- `app/Http/Resources/TicketMessageResource.php`
- `database/migrations/YYYY_create_support_tickets_table.php`
- `database/migrations/YYYY_create_ticket_messages_table.php`

### 1.5 Frontend

**Client:** New page `SupportPage.tsx` — ticket list + create form + message thread
**Admin:** New page `SupportListPage.tsx` — all tickets table + reply + status management

---

## 2. Admin Audit Logging

### 2.1 Overview

Automatically log all admin actions (create, update, delete, status changes) for security and compliance. Admins can view audit logs in the admin panel.

### 2.2 Data Model

**New table: `audit_logs`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PK, auto-increment | Primary key |
| user_id | bigint | FK → users.id, nullable | Admin who performed action |
| action | varchar(50) | NOT NULL | created, updated, deleted, toggled |
| subject_type | varchar(100) | NOT NULL | Model class (e.g. Hotel, Booking) |
| subject_id | bigint | nullable | Model ID |
| properties | json | nullable | Old/new values snapshot |
| ip_address | varchar(45) | nullable | Request IP |
| created_at | timestamp | | |

**Indexes:**
- `idx_audit_user` on (user_id, created_at)
- `idx_audit_subject` on (subject_type, subject_id)
- `idx_audit_created` on (created_at)

### 2.3 Implementation

Use a trait `Auditable` that hooks into Eloquent `created`, `updated`, `deleted` events on admin-only models. The trait records changes automatically.

**Admin endpoint:**

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/audit-logs | List audit logs (filter by user/action/model/date) |

### 2.4 Backend Files

- `app/Models/AuditLog.php`
- `app/Traits/Auditable.php`
- `app/Http/Controllers/Api/Admin/AuditLogController.php`
- `app/Http/Resources/AuditLogResource.php`
- `database/migrations/YYYY_create_audit_logs_table.php`

### 2.5 Frontend

**Admin:** New page `AuditLogPage.tsx` — filterable log viewer

---

## 3. Implementation Order

1. Support Tickets (Backend) — migrations + models + controllers + routes
2. Support Tickets (Frontend Client) — support page
3. Support Tickets (Frontend Admin) — admin support page
4. Audit Logging (Backend) — migration + model + trait + controller
5. Audit Logging (Frontend Admin) — audit log page
6. i18n + routes + sidebar integration
