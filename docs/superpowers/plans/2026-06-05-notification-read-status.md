# Notification Read Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add read/unread lifecycle to GoStay notifications — `read_at` column on `notification_records`, 4 new API endpoints, dropdown + page UI updates with mark-as-read + delete actions.

**Architecture:** Single migration adds nullable `read_at` timestamp. Controller gains `unreadCount`, `markAsRead`, `markAllRead`, `destroy` methods (all scoped to authenticated user). Frontend adds API methods, updates dropdown + page with visual differentiation + action buttons, and uses `useMutation` for optimistic invalidation.

**Tech Stack:** Laravel 13 (migration + controller + resource + test), React 19 + TanStack Query (mutations + invalidation), TypeScript, i18n (en/vi).

**Reference spec:** `docs/superpowers/specs/2026-06-05-notification-read-status-design.md`

---

### File Structure Overview

**Files created:**
- `database/migrations/2026_06_05_xxxxxx_add_read_at_to_notification_records_table.php`
- `tests/Feature/NotificationReadStatusTest.php`

**Files modified:**
- `app/Models/NotificationRecord.php` — fillable + casts + helpers + scope
- `app/Http/Controllers/Api/NotificationController.php` — 4 new methods
- `app/Http/Resources/NotificationResource.php` — `read_at` + `is_read`
- `routes/api.php` — 4 new routes
- `frontend/src/shared/api/notifications.ts` — interface + 4 API methods
- `frontend/src/shared/i18n/locales/en.ts` — 5 new keys
- `frontend/src/shared/i18n/locales/vi.ts` — 5 new keys
- `frontend/src/client/components/common/NotificationDropdown.tsx` — badge + visual diff + mark-as-read
- `frontend/src/client/pages/NotificationsPage.tsx` — mark-all-read + per-item actions
- `docs/FEATURE_STATUS.md` — add row 33

---

### Task 1: Migration — add `read_at` to `notification_records`

**Files:**
- Create: `database/migrations/2026_06_05_xxxxxx_add_read_at_to_notification_records_table.php`

- [ ] **Step 1: Generate the migration**

```bash
rtk php artisan make:migration add_read_at_to_notification_records_table --table=notification_records
```

Expected output: `Created Migration: yyyy_mm_dd_xxxxxx_add_read_at_to_notification_records_table`

- [ ] **Step 2: Edit the migration file**

Replace the generated `up()` method body with:

```php
Schema::table('notification_records', function (Blueprint $table) {
    $table->timestamp('read_at')->nullable()->after('sent_at');
    $table->index('read_at');
});
```

And the `down()` method body with:

```php
Schema::table('notification_records', function (Blueprint $table) {
    $table->dropIndex(['read_at']);
    $table->dropColumn('read_at');
});
```

- [ ] **Step 3: Run the migration locally**

```bash
rtk php artisan migrate
```

Expected: row `xxxxxx_add_read_at_to_notification_records_table` shown as migrated, no errors.

- [ ] **Step 4: Verify the column exists**

```bash
rtk php artisan tinker --execute="echo Schema::hasColumn('notification_records', 'read_at') ? 'OK' : 'FAIL';"
```

Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
rtk git add database/migrations/*_add_read_at_to_notification_records_table.php
rtk git commit -m "feat(db): add read_at column to notification_records"
```

---

### Task 2: Model — `NotificationRecord` helpers + scope

**Files:**
- Modify: `app/Models/NotificationRecord.php`

- [ ] **Step 1: Update `$fillable` and `casts()`**

In `app/Models/NotificationRecord.php`, replace the existing `$fillable` array with:

```php
protected $fillable = [
    'user_id', 'booking_id', 'type', 'channel', 'status', 'payload',
    'sent_at', 'email_sent_at', 'read_at',
];
```

And in the existing `casts()` method, add `'read_at' => 'datetime'`:

```php
protected function casts(): array
{
    return [
        'payload' => 'array',
        'sent_at' => 'datetime',
        'email_sent_at' => 'datetime',
        'read_at' => 'datetime',
    ];
}
```

- [ ] **Step 2: Add helper methods + scope**

After the existing `booking()` relation method, append:

```php
public function markAsRead(): bool
{
    if ($this->read_at !== null) {
        return true; // idempotent
    }
    return $this->update(['read_at' => now()]);
}

public function markAsUnread(): bool
{
    return $this->update(['read_at' => null]);
}

public function isRead(): bool
{
    return $this->read_at !== null;
}

public function scopeUnread($query)
{
    return $query->whereNull('read_at');
}
```

- [ ] **Step 3: Sanity check — tinker**

```bash
rtk php artisan tinker --execute="
\$n = App\Models\NotificationRecord::first();
if (\$n) { echo 'isRead: ' . (\$n->isRead() ? '1' : '0') . PHP_EOL; echo 'markAsRead: ' . (\$n->markAsRead() ? '1' : '0') . PHP_EOL; } else { echo 'no records'; }
"
```

Expected: shows `isRead: 0/1` and `markAsRead: 1`, no PHP errors.

- [ ] **Step 4: Commit**

```bash
rtk git add app/Models/NotificationRecord.php
rtk git commit -m "feat(model): NotificationRecord read/unread helpers + scope"
```

---

### Task 3: Resource — expose `read_at` and `is_read`

**Files:**
- Modify: `app/Http/Resources/NotificationResource.php`

- [ ] **Step 1: Read the existing resource first**

```bash
rtk cat app/Http/Resources/NotificationResource.php
```

- [ ] **Step 2: Add fields**

In the `toArray()` method, add (alongside the existing fields):

```php
'read_at' => $this->read_at?->toIso8601String(),
'is_read' => $this->read_at !== null,
```

(Make sure the method still returns the existing fields — only add these 2 new keys.)

- [ ] **Step 3: Commit**

```bash
rtk git add app/Http/Resources/NotificationResource.php
rtk git commit -m "feat(resource): expose read_at + is_read in NotificationResource"
```

---

### Task 4: Controller — 4 new methods + authorization

**Files:**
- Modify: `app/Http/Controllers/Api/NotificationController.php`

- [ ] **Step 1: Add the `unreadCount` method**

```php
public function unreadCount(Request $request)
{
    $count = $request->user()
        ->notificationRecords()
        ->unread()
        ->count();

    return response()->json(['count' => $count]);
}
```

- [ ] **Step 2: Add `markAsRead`**

```php
public function markAsRead(Request $request, $notification)
{
    $record = $request->user()
        ->notificationRecords()
        ->where('id', $notification)
        ->first();

    if (! $record) {
        return response()->json(['message' => 'Not found'], 404);
    }

    $record->markAsRead();

    return response()->json(['message' => 'ok']);
}
```

Note: we don't use route-model binding with `{notification: NotificationRecord}` because Laravel's default binding would look up by ID without user scoping. Manual lookup with `where('user_id', auth()->id())` prevents ID enumeration.

- [ ] **Step 3: Add `markAllRead`**

```php
public function markAllRead(Request $request)
{
    $count = $request->user()
        ->notificationRecords()
        ->unread()
        ->update(['read_at' => now()]);

    return response()->json(['message' => 'ok', 'updated' => $count]);
}
```

Single `UPDATE` statement — atomic.

- [ ] **Step 4: Add `destroy`**

```php
public function destroy(Request $request, $notification)
{
    $record = $request->user()
        ->notificationRecords()
        ->where('id', $notification)
        ->first();

    if (! $record) {
        return response()->json(['message' => 'Not found'], 404);
    }

    $record->delete();

    return response()->json(['message' => 'ok']);
}
```

- [ ] **Step 5: Commit**

```bash
rtk git add app/Http/Controllers/Api/NotificationController.php
rtk git commit -m "feat(controller): notification markAsRead, markAllRead, destroy, unreadCount"
```

---

### Task 5: Routes — register 4 new endpoints

**Files:**
- Modify: `routes/api.php`

- [ ] **Step 1: Add routes inside `auth:sanctum` middleware group**

Locate the existing line `Route::get('/notifications', [NotificationController::class, 'index']);` inside the `auth:sanctum` group. Add 4 new routes after it:

```php
Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
```

Place the static routes (`unread-count`, `mark-all-read`) BEFORE the `{notification}` routes so Laravel doesn't try to interpret "unread-count" as an ID.

- [ ] **Step 2: Verify routes registered**

```bash
rtk php artisan route:list --path=notifications | head -20
```

Expected: 5 rows total — `index`, `unread-count`, `mark-all-read`, `{notification}/read`, `{notification} (DELETE)`. All require `auth:sanctum`.

- [ ] **Step 3: Commit**

```bash
rtk git add routes/api.php
rtk git commit -m "feat(routes): notification read/delete endpoints"
```

---

### Task 6: Feature test — `NotificationReadStatusTest`

**Files:**
- Create: `tests/Feature/NotificationReadStatusTest.php`

- [ ] **Step 1: Write the test file**

```php
<?php

namespace Tests\Feature;

use App\Models\NotificationRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationReadStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_gets_401(): void
    {
        $this->getJson('/api/notifications/unread-count')->assertUnauthorized();
    }

    public function test_unread_count_starts_at_zero(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJson(['count' => 0]);
    }

    public function test_mark_as_read_sets_read_at(): void
    {
        $user = User::factory()->create();
        $n = NotificationRecord::factory()->create([
            'user_id' => $user->id,
            'read_at' => null,
        ]);

        $this->actingAs($user)
            ->postJson("/api/notifications/{$n->id}/read")
            ->assertOk();

        $this->assertNotNull($n->fresh()->read_at);
    }

    public function test_mark_as_read_is_idempotent(): void
    {
        $user = User::factory()->create();
        $n = NotificationRecord::factory()->create([
            'user_id' => $user->id,
            'read_at' => now(),
        ]);
        $original = $n->read_at;

        $this->actingAs($user)
            ->postJson("/api/notifications/{$n->id}/read")
            ->assertOk();

        $this->assertEquals($original->timestamp, $n->fresh()->read_at->timestamp);
    }

    public function test_mark_all_read_clears_unread(): void
    {
        $user = User::factory()->create();
        NotificationRecord::factory()->count(3)->create([
            'user_id' => $user->id,
            'read_at' => null,
        ]);

        $this->actingAs($user)
            ->postJson('/api/notifications/mark-all-read')
            ->assertOk()
            ->assertJson(['updated' => 3]);

        $this->assertEquals(0, $user->notificationRecords()->unread()->count());
    }

    public function test_destroy_deletes_notification(): void
    {
        $user = User::factory()->create();
        $n = NotificationRecord::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->deleteJson("/api/notifications/{$n->id}")
            ->assertOk();

        $this->assertDatabaseMissing('notification_records', ['id' => $n->id]);
    }

    public function test_other_users_notification_returns_404(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $n = NotificationRecord::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($attacker)
            ->postJson("/api/notifications/{$n->id}/read")
            ->assertNotFound();

        $this->actingAs($attacker)
            ->deleteJson("/api/notifications/{$n->id}")
            ->assertNotFound();

        // Owner's notification is untouched
        $this->assertDatabaseHas('notification_records', ['id' => $n->id]);
    }
}
```

- [ ] **Step 2: Verify the factory exists**

```bash
rtk ls database/factories/ | grep -i notification
```

If `NotificationRecordFactory.php` exists, no action. If not, create one quickly (might already exist from prior work).

- [ ] **Step 3: Run the test**

```bash
rtk composer test -- --filter=NotificationReadStatusTest
```

Expected: 7 tests, all pass.

If `NotificationRecordFactory` doesn't exist, create it with:

```php
// database/factories/NotificationRecordFactory.php
class NotificationRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => 'booking.created',
            'channel' => 'database',
            'status' => 'sent',
            'sent_at' => now(),
        ];
    }
}
```

- [ ] **Step 4: Commit**

```bash
rtk git add tests/Feature/NotificationReadStatusTest.php database/factories/NotificationRecordFactory.php
rtk git commit -m "test: notification read status endpoints + authorization"
```

---

### Task 7: Frontend API client

**Files:**
- Modify: `frontend/src/shared/api/notifications.ts`

- [ ] **Step 1: Update the `Notification` interface**

Add `read_at: string | null` and `is_read: boolean` to the existing interface. Final interface should look like:

```ts
export interface Notification {
  id: number;
  booking_id: number | null;
  type: string;
  channel: string;
  status: string;
  payload: Record<string, unknown> | null;
  message: string | null;
  booking: { id: number; booking_code: string } | null;
  sent_at: string | null;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
}
```

- [ ] **Step 2: Add 4 new API methods**

Extend the `notificationsApi` object. Final form:

```ts
export const notificationsApi = {
  list: () => apiClient.get<{ data: Notification[] }>('/notifications'),
  getUnreadCount: () => apiClient.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: number) => apiClient.post<{ message: string }>(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post<{ message: string; updated: number }>('/notifications/mark-all-read'),
  delete: (id: number) => apiClient.delete<{ message: string }>(`/notifications/${id}`),
};
```

- [ ] **Step 3: Commit**

```bash
rtk git add frontend/src/shared/api/notifications.ts
rtk git commit -m "feat(api): notification read/delete client methods"
```

---

### Task 8: i18n keys (en + vi)

**Files:**
- Modify: `frontend/src/shared/i18n/locales/en.ts`
- Modify: `frontend/src/shared/i18n/locales/vi.ts`

- [ ] **Step 1: Locate the `notifications` block**

```bash
rtk grep -n "notifications:" frontend/src/shared/i18n/locales/en.ts
rtk grep -n "notifications:" frontend/src/shared/i18n/locales/vi.ts
```

- [ ] **Step 2: Add 5 keys to English locale**

In the existing `notifications: { ... }` block of `en.ts`, add:

```ts
notifications: {
  // ... existing keys
  markAllRead: 'Mark all as read',
  markAsRead: 'Mark as read',
  delete: 'Delete',
  deleteConfirm: 'Delete this notification?',
  unread: 'Unread',
},
```

- [ ] **Step 3: Add the same 5 keys to Vietnamese locale**

In `vi.ts`, add the same keys with Vietnamese values:

```ts
notifications: {
  // ... existing keys
  markAllRead: 'Đánh dấu tất cả đã đọc',
  markAsRead: 'Đánh dấu đã đọc',
  delete: 'Xóa',
  deleteConfirm: 'Xóa thông báo này?',
  unread: 'Chưa đọc',
},
```

- [ ] **Step 4: Verify both files parse correctly**

```bash
cd frontend && rtk npx tsc --noEmit src/shared/i18n/locales/en.ts src/shared/i18n/locales/vi.ts && cd ..
```

Expected: no errors. If TypeScript complains, fix the syntax.

- [ ] **Step 5: Commit**

```bash
rtk git add frontend/src/shared/i18n/locales/en.ts frontend/src/shared/i18n/locales/vi.ts
rtk git commit -m "feat(i18n): notification read/delete keys (en + vi)"
```

---

### Task 9: NotificationDropdown UI updates

**Files:**
- Modify: `frontend/src/client/components/common/NotificationDropdown.tsx`

- [ ] **Step 1: Replace the badge query with `getUnreadCount`**

Find the existing `useQuery` for `['notifications', 'badge']` (currently calls `notificationsApi.list()` to derive count). Replace with:

```tsx
const { data: unreadCount } = useQuery({
  queryKey: ['notifications', 'badge'],
  queryFn: () => notificationsApi.getUnreadCount().then(r => r.data.count),
  refetchInterval: 60_000,
  staleTime: 30_000,
});
```

Update the `displayCount` reference to `unreadCount ?? 0`.

- [ ] **Step 2: Add a `useMutation` for `markAsRead`**

After the existing queries, add:

```tsx
const queryClient = useQueryClient();

const markReadMutation = useMutation({
  mutationFn: (id: number) => notificationsApi.markAsRead(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  },
});
```

You'll need to import `useMutation` and `useQueryClient` from `@tanstack/react-query`.

- [ ] **Step 3: Visual differentiation — unread items**

In the item render, wrap the content with classes conditional on `!n.is_read`. Add a small dot before the type badge:

```tsx
{!n.is_read && (
  <span className="inline-block size-2 rounded-full bg-primary" aria-hidden />
)}
```

And apply `opacity-60` to read items:

```tsx
<div
  key={n.id}
  className={`px-4 py-3 transition-colors hover:bg-tab/30 ${n.is_read ? 'opacity-60' : ''}`}
>
```

- [ ] **Step 4: Mark-as-read on click**

Make the entire item row clickable. On click (for unread items), fire the mutation. If a booking link exists, navigate after the mutation resolves:

```tsx
const handleClick = (n: Notification) => {
  if (!n.is_read) {
    markReadMutation.mutate(n.id);
  }
  if (n.booking?.booking_code) {
    setOpen(false);
    // navigation handled by Link wrapper
  }
};
```

Replace the existing `<div>` wrapper with a handler that calls `handleClick(n)`.

- [ ] **Step 5: "Mark all as read" footer button**

Add a footer button when there are unread notifications. Replace the existing footer block:

```tsx
{(unreadCount ?? 0) > 0 && (
  <div className="border-t border-border/30 px-4 py-2">
    <button
      type="button"
      onClick={() => markAllReadMutation.mutate()}
      disabled={markAllReadMutation.isPending}
      className="block w-full text-center text-xs font-medium text-primary hover:underline disabled:opacity-50"
    >
      {t('notifications.markAllRead')}
    </button>
  </div>
)}
```

Add the corresponding `markAllReadMutation`:

```tsx
const markAllReadMutation = useMutation({
  mutationFn: () => notificationsApi.markAllRead(),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  },
});
```

Keep the existing "View all" link as a second footer element if desired, or replace it.

- [ ] **Step 6: Sanity check — visual diff**

```bash
cd frontend && rtk npm run build && cd ..
```

Expected: build succeeds. (No TypeScript errors — if any, fix imports.)

- [ ] **Step 7: Commit**

```bash
rtk git add frontend/src/client/components/common/NotificationDropdown.tsx
rtk git commit -m "feat(dropdown): unread badge, visual diff, mark-as-read actions"
```

---

### Task 10: NotificationsPage UI updates

**Files:**
- Modify: `frontend/src/client/pages/NotificationsPage.tsx`

- [ ] **Step 1: Add mutations for mark-as-read, mark-all-read, delete**

```tsx
const queryClient = useQueryClient();

const markReadMutation = useMutation({
  mutationFn: (id: number) => notificationsApi.markAsRead(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
});

const markAllReadMutation = useMutation({
  mutationFn: () => notificationsApi.markAllRead(),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
});

const deleteMutation = useMutation({
  mutationFn: (id: number) => notificationsApi.delete(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
});
```

Imports needed: `useMutation`, `useQueryClient` from `@tanstack/react-query`; icons (`Check`, `Trash2`) from `lucide-react`.

- [ ] **Step 2: Add "Mark all as read" button in header**

Just below the `<h1>`:

```tsx
{notifications.some(n => !n.is_read) && (
  <button
    type="button"
    onClick={() => markAllReadMutation.mutate()}
    disabled={markAllReadMutation.isPending}
    className="mb-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
  >
    <Check className="size-4" />
    {t('notifications.markAllRead')}
  </button>
)}
```

- [ ] **Step 3: Visual differentiation per item**

Add unread dot + conditional opacity. Inside the item card:

```tsx
<div className={`flex items-start justify-between gap-3 ${n.is_read ? 'opacity-60' : ''}`}>
  <div className="flex items-start gap-2 min-w-0 flex-1">
    {!n.is_read && (
      <span className="mt-2 inline-block size-2 shrink-0 rounded-full bg-primary" aria-hidden />
    )}
    <div className="min-w-0 flex-1">
      {/* existing badge + message + link */}
    </div>
  </div>
  ...
</div>
```

- [ ] **Step 4: Add per-item action buttons**

Add action buttons on the right side, alongside the date:

```tsx
<div className="flex items-center gap-2">
  {!n.is_read && (
    <button
      type="button"
      onClick={() => markReadMutation.mutate(n.id)}
      disabled={markReadMutation.isPending}
      className="grid size-8 place-items-center rounded-lg text-text-secondary hover:bg-tab/60 hover:text-primary disabled:opacity-50"
      title={t('notifications.markAsRead')}
      aria-label={t('notifications.markAsRead')}
    >
      <Check className="size-4" />
    </button>
  )}
  <button
    type="button"
    onClick={() => {
      if (window.confirm(t('notifications.deleteConfirm'))) {
        deleteMutation.mutate(n.id);
      }
    }}
    disabled={deleteMutation.isPending}
    className="grid size-8 place-items-center rounded-lg text-text-secondary hover:bg-tab/60 hover:text-destructive disabled:opacity-50"
    title={t('notifications.delete')}
    aria-label={t('notifications.delete')}
  >
    <Trash2 className="size-4" />
  </button>
  <span className="whitespace-nowrap text-xs text-text-secondary">
    {n.sent_at ? formatDateForLocale(n.sent_at, locale) : t('notifications.noDate')}
  </span>
</div>
```

- [ ] **Step 5: Sanity check**

```bash
cd frontend && rtk npm run build && cd ..
```

Expected: build succeeds. (If any TypeScript error, fix and retry.)

- [ ] **Step 6: Commit**

```bash
rtk git add frontend/src/client/pages/NotificationsPage.tsx
rtk git commit -m "feat(page): NotificationsPage mark-as-read + delete actions"
```

---

### Task 11: Docs update

**Files:**
- Modify: `docs/FEATURE_STATUS.md`

- [ ] **Step 1: Add row 33 to the implementation summary table**

After row 32 (`Partner Booking Management`), add:

```md
| 33 | Notification Read Status & Lifecycle | NotificationController (markAsRead, markAllRead, destroy, unreadCount), NotificationRecord (read_at, scope) | NotificationDropdown (unread badge, visual diff, mark-as-read), NotificationsPage (mark-all-read, per-item delete) | — | [spec](superpowers/specs/2026-06-05-notification-read-status-design.md) |
```

- [ ] **Step 2: Update "Last updated" header**

Change line 3 from `Last updated: 2026-06-04` to `Last updated: 2026-06-05`.

- [ ] **Step 3: Commit**

```bash
rtk git add docs/FEATURE_STATUS.md
rtk git commit -m "docs: feature 33 — Notification Read Status & Lifecycle"
```

---

### Task 12: Final validation + PR

- [ ] **Step 1: Full backend test**

```bash
rtk composer test
```

Expected: all tests pass (including the 7 new `NotificationReadStatusTest` cases).

- [ ] **Step 2: Frontend build**

```bash
cd frontend && rtk npm run build && cd ..
```

Expected: build succeeds, no TypeScript errors.

- [ ] **Step 3: Push the branch**

```bash
rtk git push -u origin feature/notification-read-status
```

- [ ] **Step 4: Create PR**

```bash
rtk gh pr create --base master --head feature/notification-read-status \
  --title "feat: notification read status & lifecycle (mark as read, delete)" \
  --body "## Summary
- Add \`read_at\` column to \`notification_records\`
- 4 new endpoints: \`unread-count\`, \`markAsRead\`, \`markAllRead\`, \`destroy\` (all user-scoped)
- NotificationDropdown: badge shows unread count, visual differentiation, mark-as-read on click, mark-all-read button
- NotificationsPage: mark-all-read header button, per-item mark-as-read + delete actions
- 7 new feature tests covering happy path + authorization

## Spec
docs/superpowers/specs/2026-06-05-notification-read-status-design.md

## Plan
docs/superpowers/plans/2026-06-05-notification-read-status.md (Tasks 1-11 complete)

## Test plan
- [ ] Backend: \`composer test --filter=NotificationReadStatusTest\` passes (7 cases)
- [ ] Frontend build passes
- [ ] Manual: badge shows correct unread count
- [ ] Manual: clicking unread item marks it read (badge decrements)
- [ ] Manual: 'Mark all as read' clears badge
- [ ] Manual: per-item delete works with confirmation
- [ ] Manual: cannot mark/delete another user's notification (returns 404)
- [ ] CI passes on PR

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

---

## Implementation Notes

**Backend execution order:** Tasks 1-6 are sequential (migration → model → resource → controller → routes → test). Run in one wave.

**Frontend execution order:** Tasks 7-8 (API + i18n) can be parallelized. Tasks 9-10 (Dropdown + Page) can be parallelized after 7-8.

**Parallel agent wave suggestion:**
- Wave A (sequential): Task 1, then 2, then 3
- Wave B (parallel): Tasks 4, 5
- Wave C (sequential): Task 6 (test) — verifies backend wave
- Wave D (parallel): Tasks 7, 8 (frontend API + i18n)
- Wave E (parallel): Tasks 9, 10 (Dropdown + Page UI)
- Wave F: Task 11 (docs) → Task 12 (PR)
