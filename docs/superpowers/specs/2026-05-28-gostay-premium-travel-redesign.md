# GoStay Premium Travel Redesign

## Status

approved direction, pending implementation

## Goal

Redesign the customer-facing GoStay UI toward a premium travel editorial style:
warm, image-led, credible, and conversion-focused without copying Agoda or
Booking.com directly.

## Visual Direction

Use the selected A direction from the brainstorm mockup:

- Real destination imagery as the first visual signal.
- Warm neutral page background with deep ink text and teal primary actions.
- Search-first hero with a compact elevated booking form.
- Editorial destination sections that feel curated, not generic.
- Hotel cards with stronger image hierarchy, location, rating, amenities, price,
  and a clear booking CTA.

Avoid:

- Blue-gradient-only UI.
- Emoji-driven hotel placeholders as the primary visual language.
- Overly rounded, toy-like cards.
- Marketing-only hero copy that hides the actual booking workflow.

## Scope

Implement the redesign across the customer-facing booking flow surfaces already
visible in the app:

- `ClientLayout`, `Navbar`, and `Footer`.
- Homepage sections:
  - `HeroSearch`
  - `LocationGrid`
  - `FeaturedHotels`
  - `HotelCard`
- Search results styling:
  - `SearchPage`
  - `SearchResults`
  - `HotelSearchCard`
  - `SearchFilters`
  - `SortBar`
- Global visual tokens in `frontend/src/index.css`.

Out of scope:

- Backend/API changes.
- Admin UI.
- Auth form redesign unless needed for layout consistency.
- New external image service integration.

## UX Requirements

- The homepage must put booking search in the first viewport on desktop and
  mobile.
- Destination and hotel sections must render well even when API image paths are
  missing; fallback visuals should look intentional.
- Cards must be scan-friendly: name, location, rating, amenities/deal cue, and
  price should be clear.
- Search results must feel denser and more transactional than the homepage while
  keeping the same visual system.
- Mobile layout must avoid horizontal overflow and oversized hero text.

## Implementation Notes

- Keep existing React Query/API behavior.
- Reuse existing data fields: `location`, `images`, `amenities`, `star_rating`,
  `min_price`, `room_types`.
- Prefer CSS/Tailwind-only visual changes and small presentational helpers.
- Use lucide icons where icons improve clarity.
- Use remote Unsplash-style fallback backgrounds only where current data lacks
  usable image URLs; do not block UI on image availability.

## Validation

- `npm run build` from `frontend/`.
- Smoke check:
  - `http://localhost:5173/`
  - `http://localhost:5173/search`
  - one hotel detail route from a visible card.
- Verify `/api/locations` and `/api/hotels/featured` still return JSON through
  frontend Nginx proxy.

## Open Decisions

- Keep brand name `GoStay`.
- Keep Vietnamese copy without diacritics for now to match current app copy.
- Use premium editorial visual direction A as the approved baseline.
