# GoStay — Hotel Name Search Design

**Date:** 2026-06-05
**Branch:** feature/hotel-name-search
**Status:** Design approved (autonomous mode), ready for plan

## Problem

The hotel search currently filters by `location`, `star`, `types`, `amenities`, `price`, and `guests`, but **does not accept any keyword/free-text input**. Users searching for a specific hotel name (e.g. "Hilton", "Sheraton") have no way to narrow results — they must scan the full paginated list. The home page search form has a location input, but no hotel-name field.

The search request (`HotelSearchRequest`) has no `q` parameter; `HotelController::index` has no name filter clause.

## Decision

Add a single optional `q` query parameter that filters hotels where `name LIKE '%{q}%'`. Wire it through the existing `HotelSearchRequest`, controller, and the client UI (search filters panel + URL params). Keep scope tight — no full-text indexes, no fuzzy matching, no location/name disambiguation.

## Architecture

### Backend

**`HotelSearchRequest` — add one rule:**

```php
'q' => ['nullable', 'string', 'max:100'],
```

Max 100 chars to prevent abuse. Trim before query.

**`HotelController::index` — add LIKE clause:**

After the existing `location` filter block:

```php
if ($q = trim((string) $request->q)) {
    $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $q);
    $query->whereRaw('LOWER(name) LIKE LOWER(?) ESCAPE ?', ['%' . $escaped . '%', '\\']);
}
```

Uses `whereRaw` with `ESCAPE '\\'` to standardize escape behavior across MySQL and SQLite (SQLite has no default escape char; MySQL defaults to backslash). Manual escape via `str_replace` covers backslash, percent, and underscore. Case-insensitive via `LOWER()` on both sides.

**Resource:** No change — `name` is already in `HotelResource`.

### Frontend

**`SearchFilters.tsx` — add a text input above price range:**

- Label: `t('search.hotelName')` (new i18n key)
- Placeholder: `t('search.hotelNamePlaceholder')` ("Hotel name...")
- Controlled input, syncs into filter state as `q: string`
- On apply: writes `q` to URL params (or deletes if empty)
- On clear: removes `q` from URL

**`useReducer` state shape** — add `q: string` field, plus reducer actions `setQuery`.

**Initial state** reads `searchParams.get('q') ?? ''`.

**i18n keys added (en + vi):**

| Key | en | vi |
|---|---|---|
| `search.hotelName` | Hotel name | Tên khách sạn |
| `search.hotelNamePlaceholder` | Search by hotel name | Tìm theo tên khách sạn |

### Test

One Pest feature test file: `tests/Feature/HotelNameSearchTest.php`. Covers:

1. `q` empty returns all active hotels (no filter applied).
2. `q=Hilton` returns only hotels whose name contains "Hilton" (case-insensitive).
3. `q` with no match returns empty list.
4. LIKE special chars (`%`, `_`) are escaped — searching "100%" returns hotel named "100%" literally, not all hotels.
5. `q` longer than 100 chars is rejected (422).
6. Combines with `location` filter correctly.

Uses existing `Hotel` factory.

### Docs

Update `docs/FEATURE_STATUS.md` — add row 34: "Hotel Name Search".

## Risks & Mitigations

| Risk | Probability | Mitigation |
|---|---|---|
| Leading-wildcard LIKE bypasses index | High (intended) | At current scale (under 10k hotels), full table scan is fast. Add full-text index later if needed. |
| LIKE wildcard injection from raw user input | Medium | Escape `%` and `_` with `addcslashes` before LIKE. |
| XSS via displayed `q` in input value | Low | React auto-escapes by default; no raw HTML rendering. |
| Empty `q` (just spaces) doesn't filter | Medium | `trim()` before LIKE; treat whitespace-only as empty. |

## Out of Scope

- Full-text search (MySQL FULLTEXT index).
- Fuzzy matching / typo tolerance.
- Search across description, address, or amenities — only `name`.
- Search suggestions / autocomplete dropdown.
- Debounced live search — keep "Apply filters" button UX.

## Success Criteria

1. User can type a hotel name in the search filters panel and see only matching results after clicking "Apply".
2. URL parameter `q=...` is preserved across page navigation and reloads.
3. "Clear filters" removes the `q` parameter.
4. Backend rejects `q` longer than 100 chars (422).
5. LIKE special chars are escaped (no wildcard injection).
6. New feature test file passes (6 cases).
7. Existing `HotelSearchApiTest` still passes (no regression).

## Open Questions

None at design time.
