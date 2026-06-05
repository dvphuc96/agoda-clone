# Hotel Name Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `q` keyword parameter to hotel search so users can filter by hotel name from the search filters panel.

**Architecture:** Single LIKE clause on `hotels.name` with `%`/`_` escaping. One new request rule, one new controller branch, one new filter UI input, two new i18n keys, one feature test file.

**Tech Stack:** Laravel 13 (FormRequest + controller + test), React 19 + useReducer (filter state extension), TypeScript, i18n (en/vi).

**Reference spec:** `docs/superpowers/specs/2026-06-05-hotel-name-search-design.md`

---

### File Structure Overview

**Files created:**
- `tests/Feature/HotelNameSearchTest.php`

**Files modified:**
- `app/Http/Requests/HotelSearchRequest.php` — add `q` rule
- `app/Http/Controllers/Api/HotelController.php` — add LIKE clause
- `frontend/src/client/components/search/SearchFilters.tsx` — add query input + state + URL sync
- `frontend/src/shared/i18n/locales/en.ts` — 2 new keys
- `frontend/src/shared/i18n/locales/vi.ts` — 2 new keys
- `frontend/src/shared/i18n/types.ts` — schema update
- `docs/FEATURE_STATUS.md` — row 34

---

### Task 1: Backend validation rule

**Files:**
- Modify: `app/Http/Requests/HotelSearchRequest.php`

- [ ] **Step 1: Add `q` rule to `rules()`**

Open `app/Http/Requests/HotelSearchRequest.php` and add this line to the array returned by `rules()`, after `'location'`:

```php
'q' => ['nullable', 'string', 'max:100'],
```

The full rules array becomes:

```php
return [
    'location' => ['nullable', 'string'],
    'q' => ['nullable', 'string', 'max:100'],
    'check_in' => ['nullable', 'date', 'after_or_equal:today'],
    'check_out' => ['nullable', 'date', 'after:check_in'],
    'guests' => ['nullable', 'integer', 'min:1'],
    'star' => ['nullable', 'integer', 'between:1,5'],
    'price_min' => ['nullable', 'numeric', 'min:0'],
    'price_max' => ['nullable', 'numeric', Rule::when($this->filled('price_min'), 'gt:price_min')],
    'types' => ['nullable', 'string'],
    'amenities' => ['nullable', 'string'],
    'sort' => ['nullable', 'in:popular,price_asc,price_desc,rating'],
    'page' => ['nullable', 'integer', 'min:1'],
];
```

- [ ] **Step 2: Commit**

```bash
rtk git add app/Http/Requests/HotelSearchRequest.php
rtk git commit -m "feat(search): add q validation rule for hotel name search"
```

---

### Task 2: Backend controller LIKE clause

**Files:**
- Modify: `app/Http/Controllers/Api/HotelController.php`

- [ ] **Step 1: Add the name filter block**

In `HotelController::index`, immediately after the `if ($request->location) { ... }` block (around line 46), insert:

```php
if ($q = trim((string) $request->q)) {
    $escaped = addcslashes($q, '%_\\');
    $query->where('name', 'like', "%{$escaped}%");
}
```

- [ ] **Step 2: Verify syntax**

```bash
rtk php -l app/Http/Controllers/Api/HotelController.php
```

Expected: `No syntax errors detected`

- [ ] **Step 3: Commit**

```bash
rtk git add app/Http/Controllers/Api/HotelController.php
rtk git commit -m "feat(search): filter hotels by name via q parameter"
```

---

### Task 3: Backend feature tests

**Files:**
- Create: `tests/Feature/HotelNameSearchTest.php`

- [ ] **Step 1: Create the test file**

Write the file `tests/Feature/HotelNameSearchTest.php` with the following content:

```php
<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelNameSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_empty_q_returns_all_active_hotels(): void
    {
        Hotel::factory()->count(3)->create(['status' => 'active']);

        $response = $this->getJson('/api/hotels');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_q_filters_by_name_substring_case_insensitively(): void
    {
        Hotel::factory()->create(['name' => 'Hilton Hanoi', 'status' => 'active']);
        Hotel::factory()->create(['name' => 'Sheraton Saigon', 'status' => 'active']);
        Hotel::factory()->create(['name' => 'Hanoi Hilton Hotel', 'status' => 'active']);

        $response = $this->getJson('/api/hotels?q=hilton');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_q_with_no_match_returns_empty_list(): void
    {
        Hotel::factory()->create(['name' => 'Hilton Hanoi', 'status' => 'active']);

        $response = $this->getJson('/api/hotels?q=NonexistentHotel');

        $response->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_q_with_like_special_chars_is_escaped(): void
    {
        Hotel::factory()->create(['name' => '100% Awesome Hotel', 'status' => 'active']);
        Hotel::factory()->create(['name' => 'Another Hotel', 'status' => 'active']);

        // Searching "100%" literally — should match only the first hotel, not both
        $response = $this->getJson('/api/hotels?q=' . urlencode('100%'));

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertSame('100% Awesome Hotel', $response->json('data.0.name'));
    }

    public function test_q_over_100_chars_is_rejected(): void
    {
        $longQuery = str_repeat('a', 101);

        $response = $this->getJson('/api/hotels?q=' . $longQuery);

        $response->assertStatus(422);
    }

    public function test_q_combines_with_location_filter(): void
    {
        $hanoi = Location::factory()->create(['slug' => 'hanoi']);
        $saigon = Location::factory()->create(['slug' => 'saigon']);

        Hotel::factory()->create([
            'name' => 'Hilton Hanoi',
            'status' => 'active',
            'location_id' => $hanoi->id,
        ]);
        Hotel::factory()->create([
            'name' => 'Hilton Saigon',
            'status' => 'active',
            'location_id' => $saigon->id,
        ]);

        $response = $this->getJson('/api/hotels?q=hilton&location=hanoi');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertSame('Hilton Hanoi', $response->json('data.0.name'));
    }
}
```

- [ ] **Step 2: Run the tests and verify all pass**

```bash
rtk php artisan test tests/Feature/HotelNameSearchTest.php
```

Expected: 6 tests, 6 passed.

- [ ] **Step 3: Run the existing search test for regression check**

```bash
rtk php artisan test tests/Feature/HotelSearchApiTest.php
```

Expected: all existing tests still pass.

- [ ] **Step 4: Commit**

```bash
rtk git add tests/Feature/HotelNameSearchTest.php
rtk git commit -m "test(search): cover hotel name search (6 cases incl. LIKE escape)"
```

---

### Task 4: Frontend i18n keys

**Files:**
- Modify: `frontend/src/shared/i18n/locales/en.ts`
- Modify: `frontend/src/shared/i18n/locales/vi.ts`
- Modify: `frontend/src/shared/i18n/types.ts`

- [ ] **Step 1: Add keys to `en.ts`**

Inside the `search: { ... }` block in `frontend/src/shared/i18n/locales/en.ts`, add two keys (place near other filter labels, e.g. after `priceRange` or wherever fits):

```ts
hotelName: 'Hotel name',
hotelNamePlaceholder: 'Search by hotel name',
```

- [ ] **Step 2: Add keys to `vi.ts`**

Same location in `frontend/src/shared/i18n/locales/vi.ts`:

```ts
hotelName: 'Tên khách sạn',
hotelNamePlaceholder: 'Tìm theo tên khách sạn',
```

- [ ] **Step 3: Add type declarations**

In `frontend/src/shared/i18n/types.ts`, find the `search: { ... }` block in the schema and add:

```ts
hotelName: string;
hotelNamePlaceholder: string;
```

- [ ] **Step 4: Verify typecheck**

```bash
cd frontend && rtk npx tsc --noEmit
```

Expected: `TypeScript: No errors found`

- [ ] **Step 5: Commit**

```bash
rtk git add frontend/src/shared/i18n/locales/en.ts frontend/src/shared/i18n/locales/vi.ts frontend/src/shared/i18n/types.ts
rtk git commit -m "i18n(search): add hotelName + hotelNamePlaceholder keys (en/vi)"
```

---

### Task 5: Frontend SearchFilters UI

**Files:**
- Modify: `frontend/src/client/components/search/SearchFilters.tsx`

- [ ] **Step 1: Extend `FilterState` and reducer actions**

Update the `FilterState` interface to include `q: string`:

```ts
interface FilterState {
  q: string;
  priceMin: string;
  priceMax: string;
  star: number;
  selectedTypes: string[];
  selectedAmenities: string[];
}
```

Add a new action type `'setQuery'` to `FilterAction`:

```ts
type FilterAction =
  | { type: 'setQuery'; value: string }
  | { type: 'setPriceMin'; value: string }
  | { type: 'setPriceMax'; value: string }
  | { type: 'toggleStar'; value: number }
  | { type: 'toggleType'; value: string }
  | { type: 'toggleAmenity'; value: string }
  | { type: 'clear' };
```

Add the new case to `filterReducer`:

```ts
case 'setQuery':
  return { ...state, q: action.value };
```

Update the `'clear'` case to also reset `q: ''`.

- [ ] **Step 2: Initialize `q` from URL params**

Update the `useReducer` initial state to read `q`:

```ts
const [state, dispatch] = useReducer(filterReducer, {
  q: searchParams.get('q') ?? '',
  priceMin: searchParams.get('price_min') || String(priceBounds.min),
  priceMax: searchParams.get('price_max') || String(priceBounds.max),
  star: Number(searchParams.get('star')) || 0,
  selectedTypes: searchParams.get('types')?.split(',').filter(Boolean) ?? [],
  selectedAmenities: searchParams.get('amenities')?.split(',').filter(Boolean) ?? [],
});
```

- [ ] **Step 3: Wire `q` into `applyFilters` and `clearFilters`**

In `applyFilters`, before `params.set('price_min', ...)`:

```ts
const trimmedQ = state.q.trim();
if (trimmedQ) params.set('q', trimmedQ);
else params.delete('q');
```

In `clearFilters` (the local one), add `dispatch({ type: 'clear' })` is already there; just also `params.delete('q')`:

```ts
params.delete('q');
```

Place it with the other `params.delete(...)` calls.

- [ ] **Step 4: Add the text input UI**

Inside the `<div>` that wraps the price range section (the one starting with `<h4>{t('search.priceRange')}</h4>`), insert a new section **above** the price range block but inside the parent `<div className="border-t border-border pt-4">` so it visually starts the filter list. The simplest placement: insert before the price-range `<div className="mb-3 ...">` block:

```tsx
<div className="mb-5 border-b border-border pb-4">
  <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">
    {t('search.hotelName')}
  </h4>
  <input
    type="text"
    value={state.q}
    onChange={e => dispatch({ type: 'setQuery', value: e.target.value })}
    placeholder={t('search.hotelNamePlaceholder')}
    className="w-full rounded-full border border-border bg-warm-surface px-4 py-2 text-sm text-text placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    maxLength={100}
  />
</div>
```

- [ ] **Step 5: Verify typecheck and build**

```bash
cd frontend && rtk npx tsc --noEmit && rtk npm run build
```

Expected: No TS errors; build succeeds.

- [ ] **Step 6: Commit**

```bash
rtk git add frontend/src/client/components/search/SearchFilters.tsx
rtk git commit -m "feat(search): add hotel name input to SearchFilters"
```

---

### Task 6: Docs update

**Files:**
- Modify: `docs/FEATURE_STATUS.md`

- [ ] **Step 1: Add row 34**

Open `docs/FEATURE_STATUS.md` and add this row to the feature table after row 33 (Notification Read Status):

```
| 34 | Hotel Name Search | HotelSearchRequest (q rule) + HotelController (LIKE) | SearchFilters text input | — | — | [spec](superpowers/specs/2026-06-05-hotel-name-search-design.md) |
```

- [ ] **Step 2: Commit**

```bash
rtk git add docs/FEATURE_STATUS.md
rtk git commit -m "docs: add Hotel Name Search to feature status table"
```

---

### Task 7: Final validation and PR

- [ ] **Step 1: Run full backend test suite for affected area**

```bash
rtk php artisan test tests/Feature/HotelNameSearchTest.php tests/Feature/HotelSearchApiTest.php
```

Expected: all pass.

- [ ] **Step 2: Run frontend typecheck**

```bash
cd frontend && rtk npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Push branch**

```bash
rtk git push -u origin feature/hotel-name-search
```

- [ ] **Step 4: Create pull request**

Use `rtk gh pr create` with title `feat: Hotel name search` and a body listing:
- Summary: adds `q` parameter to hotel search
- Backend: validation + LIKE clause with `%`/`_` escape
- Frontend: SearchFilters text input + URL param sync
- Tests: 6 cases (empty, case-insensitive substring, no match, LIKE escape, length validation, combined with location)
- Docs: row 34 in FEATURE_STATUS.md

- [ ] **Step 5: Verify branch is clean**

```bash
rtk git status
```

Expected: nothing to commit, working tree clean.
