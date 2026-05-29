# BUG-001 Homepage API Collection Normalization

## Status

done

## Lane

normal

## Product Contract

The homepage and hotel detail room list must render without crashing when API
collection responses arrive as Laravel resource envelopes, bare arrays, or a
nested collection envelope.

## Relevant Product Docs

- `docs/product/README.md`

## Acceptance Criteria

- Homepage destination select renders only an array of locations.
- Homepage destination grid renders only an array of locations.
- Homepage featured hotels renders only an array of hotels.
- Hotel detail room availability renders only an array of room types.
- Frontend build/typecheck passes.

## Design Notes

- API: collection responses are normalized in `frontend/src/shared/api/hotels.ts`.
- UI surfaces: homepage search, homepage location grid, featured hotels, hotel detail rooms.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not available for this frontend slice. |
| Integration | Not available. |
| E2E | Not available. |
| Platform | `npm run build` from `frontend/`. |
| Release | Not run. |

## Harness Delta

Initialized local Harness database because `scripts/harness query matrix` and
intake were blocked by missing `harness.db`.

## Evidence

- `npm run build` passed from `frontend/`.
- `npm run lint` failed on pre-existing `react-refresh/only-export-components`
  and `react-hooks/set-state-in-effect` issues outside this fix.
