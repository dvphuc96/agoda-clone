# GoStay — Notification Read Status Design

**Date:** 2026-06-05
**Branch:** feature/notification-read-status
**Status:** Design approved, ready for plan

## Problem

The notification system currently has **no read/unread lifecycle**:

- `NotificationController` exposes only `GET /notifications` (list).
- `NotificationRecord` model has no `read_at` field — every notification looks identical whether the user has seen it or not.
- The badge in `NotificationDropdown` shows total count, not unread count.
- No way to mark notifications as read or delete them.
- Users cannot tell which notifications are new since their last visit.

The existing `notification_records` table (custom, used by code) and the unused Laravel native `notifications` table already coexist. We will extend `notification_records` (no rewrite needed).

## Decision

Add a nullable `read_at` timestamp to `notification_records` and expose 4 new endpoints for read-state management + deletion. Update the frontend dropdown + page to differentiate read/unread visually and provide actions.

## Architecture

### Database

Single migration adds one column:

```php
Schema::table('notification_records', function (Blueprint $table) {
    $table->timestamp('read_at')->nullable()->after('sent_at');
    $table->index('read_at');
});
```

`read_at IS NULL` ⇒ unread. `read_at IS NOT NULL` ⇒ read. Indexed for fast unread-count queries.

### Backend

**Model changes (`NotificationRecord`):**

- Add `read_at` to `$fillable` and to `casts()` as `datetime`.
- Add helper methods: `markAsRead()`, `markAsUnread()`, `isRead()`.
- Add query scope `unread()`.

**Controller (`NotificationController`) — 4 new endpoints:**

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/notifications/unread-count` | Returns `{ count: int }`. Lightweight — for badge polling. |
| `POST` | `/notifications/{notification}/read` | Marks one as read. Idempotent — if already read, no-op. |
| `POST` | `/notifications/mark-all-read` | Bulk marks all user's unread notifications as read. |
| `DELETE` | `/notifications/{notification}` | Deletes one notification record. |

**Authorization:** All endpoints require `auth:sanctum`. Route-model binding with scope to authenticated user only — user A cannot mark/delete user B's notifications. Returns 404 (not 403) if notification not owned, to avoid leaking existence.

**Validation:** Controller methods use route-model binding (`{notification}` → `NotificationRecord`). No form request needed — no user input beyond the route param.

**Resource (`NotificationResource`):** Add `read_at` (datetime string or null) and `is_read` (boolean computed from `read_at !== null`).

### Frontend

**API client (`shared/api/notifications.ts`):**

- Add `read_at: string | null` and `is_read: boolean` to `Notification` interface.
- Add 4 methods: `getUnreadCount()`, `markAsRead(id)`, `markAllRead()`, `delete(id)`.

**NotificationDropdown changes:**

- Badge query switches from `notificationsApi.list().length` to `notificationsApi.getUnreadCount()`. Same 60s polling interval.
- Visual differentiation: unread items get a small primary-colored dot on the left + slightly bolder text. Read items render at 60% opacity.
- Click on an unread item → fire `markAsRead` mutation + navigate (if booking link) + close dropdown.
- Footer gains a "Mark all as read" button that only appears when unread count > 0.
- Mutations invalidate both `['notifications']` and `['notifications', 'badge']` query keys.

**NotificationsPage changes:**

- Same visual differentiation as dropdown (dot + bold for unread).
- Header gets a "Mark all as read" button (visible when any unread exist).
- Each item gets two icon buttons on hover (right side): "Mark as read" (only for unread) and "Delete".
- Delete triggers a native `window.confirm` before the mutation (i18n-string message).

**i18n keys added (en + vi):**

| Key | en | vi |
|---|---|---|
| `notifications.markAllRead` | Mark all as read | Đánh dấu tất cả đã đọc |
| `notifications.markAsRead` | Mark as read | Đánh dấu đã đọc |
| `notifications.delete` | Delete | Xóa |
| `notifications.deleteConfirm` | Delete this notification? | Xóa thông báo này? |
| `notifications.unread` | Unread | Chưa đọc |

### Test

One Pest/PHPUnit feature test file: `tests/Feature/NotificationReadStatusTest.php`. Covers:

1. Unauthenticated requests get 401.
2. Authenticated user can fetch unread count (initial = 0 for fresh user).
3. `markAsRead` flips `read_at` from null to a timestamp.
4. `markAsRead` is idempotent (second call doesn't change timestamp).
5. `markAllRead` sets `read_at` on all user's unread notifications.
6. `destroy` deletes the notification.
7. User cannot mark-as-read / delete another user's notifications (gets 404).
8. `unread-count` reflects changes after mutations.

### Docs

Update `docs/FEATURE_STATUS.md` — add row 33: "Notification Read Status & Lifecycle". Update the Production Readiness table if applicable.

## Risks & Mitigations

| Risk | Probability | Mitigation |
|---|---|---|
| Migration on existing prod rows leaves `read_at = NULL` | High (intended) | Default state is "unread" — matches UX: existing notifications appear as new until user interacts |
| Race condition on `markAllRead` from multiple sessions | Low | Single SQL UPDATE statement — atomic |
| Accidentally exposing other users' notifications | Medium | Route-model binding + explicit `where('user_id', auth()->id())` scope on all queries |
| Badge polling overhead | Low | `unread-count` endpoint is a single COUNT query with index — cheaper than fetching list |
| Delete is irreversible | Medium | Use soft-delete? — NO, hard delete is intentional (matches email-inbox semantics). Confirmed via `window.confirm` |

## Out of Scope

- Real-time push (WebSockets/SSE) — still polling every 60s.
- Notification preferences/categories (email vs in-app, etc.).
- Bulk delete (only single-delete in this iteration).
- Migration of data from unused Laravel native `notifications` table.
- Refactor to Laravel native notifications (kept custom `notification_records`).

## Success Criteria

1. Badge count shows unread count, not total.
2. Unread items visually distinct from read items in both dropdown and page.
3. Click unread item → it becomes read (badge decrements, visual changes).
4. "Mark all as read" button clears all unread state.
5. Delete removes notification permanently (with confirmation).
6. Cannot access/modify another user's notifications.
7. All new endpoints covered by feature tests.
8. CI pipeline passes (composer test, npm build).

## Open Questions

None at design time.
