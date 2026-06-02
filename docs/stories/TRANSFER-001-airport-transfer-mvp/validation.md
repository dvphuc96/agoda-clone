# Validation

## Proof Strategy

Prove transfer behavior through Laravel feature tests, TypeScript production build, and React Doctor diff scan for changed React files.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Covered through service behavior exercised by feature tests. |
| Integration | Quote active transfer routes, create transfer booking, capacity validation, user ownership, admin CRUD/status updates. |
| E2E | Manual smoke target: `/transfers` search -> choose vehicle -> create pending request -> admin confirms. |
| Platform | Frontend production build. |
| Performance | No separate performance proof for MVP. |
| Logs/Audit | No new audit table in MVP. |

## Fixtures

- Seeded vehicle types: Private Sedan, Family SUV, Executive Van.
- Seeded airports for major hotel locations: HAN, DAD, SGN, PQC.

## Commands

```text
APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= php artisan test tests/Feature/TransferBookingTest.php
APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= php artisan test --testsuite=Feature
npm run build --prefix frontend
npx react-doctor@latest --verbose --diff
```

## Acceptance Evidence

- `APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= php artisan test --testsuite=Feature`: passed, 68 tests, 192 assertions.
- `APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= DB_CONNECTION=sqlite DB_DATABASE=:memory: php artisan migrate:fresh --seed --force`: passed, including transfer migrations and `TransferSeeder`.
- `npm run build --prefix frontend -- --outDir /private/tmp/gostay-transfer-build --emptyOutDir`: passed.
- `npx react-doctor@latest --verbose --diff`: score 100/100; remaining warnings are in pre-existing changed home files (`HeroSearch`, `FeaturedHotels`), not the new transfer files.
- `npm run lint --prefix frontend`: still fails on pre-existing lint errors in `frontend/@/components/ui/*`, `DateField.tsx`, `AuthContext.tsx`, and `I18nProvider.tsx`; transfer-specific warning was fixed.
