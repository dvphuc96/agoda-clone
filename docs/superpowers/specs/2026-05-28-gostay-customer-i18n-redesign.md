# GoStay Customer UI i18n Redesign

## Status

approved for planning

## Goal

Make the customer-facing GoStay experience feel polished and credible across
all existing pages, while fixing no-diacritics Vietnamese copy by introducing a
small frontend i18n foundation.

Vietnamese is the default language. English remains available through a visible
language switcher.

## Approved Scope

Implement option A from the visual scope review: polish all customer-facing
pages and route UI copy through frontend translations.

In scope:

- Customer layout, navigation, and footer.
- Homepage:
  - hero/search section
  - location grid
  - featured hotels
  - hotel cards
- Search experience:
  - search page shell
  - filters
  - sorting
  - results list
  - hotel search cards
- Hotel detail page:
  - image gallery
  - hotel information
  - room type cards
- Auth pages:
  - login
  - register
- Booking and payment flow:
  - booking page
  - booking form
  - price summary
  - payment page
- Account booking views:
  - my bookings
  - booking detail
- Shared visual tokens in `frontend/src/index.css`.
- Frontend-only i18n infrastructure under `frontend/src/shared`.

Out of scope for this slice:

- Translating hotel, room, and location records from the backend.
- Backend locale negotiation or API response changes.
- Admin UI translation and redesign.
- Database schema changes.
- New external image provider integration.

## Product Language Rules

- Default locale: `vi`.
- Secondary locale: `en`.
- User-facing static UI strings must come from translation dictionaries, not
  hardcoded JSX text.
- Vietnamese copy must use proper diacritics.
- Product data returned by the API may remain unchanged in this slice. If a
  hotel/location/room name or description comes from the database without
  diacritics, the frontend displays it as data rather than inventing a
  translation.
- Brand name remains `GoStay`.
- Currency presentation remains VND-first.

## i18n Design

Add a lightweight frontend i18n layer without adding a large dependency unless
the existing app structure makes that clearly cheaper.

Expected shape:

- `frontend/src/shared/i18n/locales/vi.ts`
- `frontend/src/shared/i18n/locales/en.ts`
- `frontend/src/shared/i18n/I18nProvider.tsx`
- `frontend/src/shared/i18n/useI18n.ts`

The provider should:

- keep the active locale in React state
- initialize from `localStorage` when present
- default to Vietnamese
- persist changes to `localStorage`
- expose `locale`, `setLocale`, and a `t(key)` translation helper

The translation helper should be simple and typed enough to avoid frequent key
typos. Interpolation is only needed for small labels such as counts, nights,
or prices if existing copy requires it.

## Visual Design Direction

Continue the approved premium travel direction:

- warm neutral background
- deep ink text
- teal primary actions
- restrained gold accents
- image-led travel surfaces
- dense, scannable transactional pages

Avoid:

- blue-gradient-only screens
- oversized generic marketing sections
- emoji or placeholder-heavy visual language
- nested card layouts
- text that overflows buttons, cards, or mobile containers

## Page-Level UX Requirements

Homepage:

- Keep the booking search visible in the first viewport.
- Make destination and featured hotel sections feel curated.
- Ensure fallback imagery looks intentional when API image paths are missing.

Search:

- Keep filters and results easy to scan.
- Make empty, loading, and error states understandable in both locales.
- Preserve existing search query behavior.

Hotel detail:

- Keep key decision information visible: images, rating, location, amenities,
  check-in/out, and room choices.
- Room cards must make capacity, bed type, price, and booking action clear.

Auth:

- Login/register pages should feel part of the same product, not scaffold
  forms.
- Error copy must be translated where frontend-owned.

Booking/payment:

- Booking summary, guest details, price summary, and payment choices must read
  clearly in Vietnamese.
- Payment status and booking status labels must be translated from known enum
  values.

My bookings:

- Booking cards and detail pages must translate status, dates, totals, and
  actions.
- Empty state should direct the user back to search.

## Architecture Notes

- Keep API clients unchanged unless a frontend type issue is discovered during
  implementation.
- Put i18n under `shared` because both current customer pages and future admin
  pages can reuse it.
- Wrap the app with `I18nProvider` near the existing `AuthProvider`.
- Add the language switcher to the customer navbar.
- Do not translate TypeScript identifiers, route paths, API field names, or
  backend enum values. Translate only display labels.
- Keep changes modular. If a page is too large, extract presentational helpers
  only when it reduces real duplication.

## Validation

Required checks:

- `npm run build` from `frontend/`.
- Smoke check these routes:
  - `/`
  - `/search`
  - `/login`
  - `/register`
  - one hotel detail route from a visible card
  - booking/payment routes where test data permits
  - `/bookings` when authenticated state permits

Visual checks:

- Desktop and mobile layouts must not show horizontal overflow.
- Vietnamese text must not clip inside buttons, cards, filters, or nav items.
- Switching VI/EN must update customer UI copy without a page reload.
- API-backed hotel/location names can remain as returned by the backend.

## Risks

- The current frontend has many hardcoded strings, so a partial pass could leave
  mixed-language screens. The implementation should search page and component
  files systematically.
- Longer Vietnamese labels can break compact controls if dimensions are not
  stable.
- Some booking/payment routes may require seeded data or login state for manual
  validation.
- Existing dirty worktree changes must be preserved; implementation should not
  revert unrelated files.

## Open Decisions

None for this slice. Backend data localization is intentionally deferred.
