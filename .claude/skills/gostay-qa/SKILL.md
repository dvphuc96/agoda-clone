---
name: gostay-qa
description: QA và testing skill cho GoStay. Hướng dẫn code review, API contract validation, smoke testing, và quality checks. Dùng khi cần review code, chạy tests, verify builds, check accessibility. Triggers: "review", "test", "QA", "check", "verify", "validate", "smoke test", "code review".
---

# QA Skill

## Workflow

### 1. Pre-Review
- Đọc task description để hiểu expected outcome
- Xác định files changed: `git diff --name-only`

### 2. Code Review Checklist

#### Frontend Review
- [ ] TypeScript compiles: `npx tsc -p frontend/tsconfig.json --noEmit`
- [ ] react-doctor: `cd frontend && npx react-doctor@latest --verbose`
- [ ] No hardcoded text in client UI (phải dùng i18n)
- [ ] Admin UI tiếng Anh
- [ ] Buttons có `type="button"` hoặc `type="submit"`
- [ ] Keys dùng unique id, không dùng array index
- [ ] Context values memoized với `useMemo`
- [ ] Mutations có `invalidateQueries` trong `onSuccess`
- [ ] Loading/error states cho mọi async operation

#### Backend Review
- [ ] PHP syntax: `php -l` cho changed files
- [ ] Routes: `php artisan route:list --path=api/`
- [ ] Tests: `php artisan test --filter=RelatedTest`
- [ ] API Resource cho mọi endpoint mới
- [ ] Form Request cho validation
- [ ] Service layer cho business logic phức tạp
- [ ] `whenLoaded()` cho eager-loaded relations

#### API Contract Review
So sánh backend Resource response vs frontend type:
- [ ] Field names match (snake_case)
- [ ] Nullable fields marked optional in TypeScript
- [ ] Enum values consistent (status fields)
- [ ] Pagination shape: `data`, `current_page`, `last_page`, `total`

### 3. Smoke Test

#### User Flow
1. Homepage loads, locations hiển thị
2. Search → results → filter → sort
3. Hotel detail → room types → select room
4. Booking form → validation → submit → redirect payment
5. Payment → success/fail callback
6. Booking detail hiển thị đúng status

#### Admin Flow
1. Dashboard stats load
2. Hotels: list → filter → create → edit → toggle status
3. Bookings: list → filter → detail → update status
4. Users: list → filter → change role → toggle active

### 4. Report Format
```
## QA Report — [Task Name]
**Status**: PASS / FAIL / PASS WITH NOTES
**react-doctor score**: XX/100

### Checks
- [x] TypeScript compile
- [x] react-doctor
- [x] PHPUnit tests
- [x] API contract match
- [ ] Issue: description (file:line)

### Notes
- Any observations
```

## Tools Reference
- `npx tsc -p frontend/tsconfig.json --noEmit` — TypeScript check
- `cd frontend && npx react-doctor@latest --verbose` — React quality
- `php artisan test` — Backend tests
- `php -l path/to/file.php` — PHP syntax
- `npm run build --prefix frontend` — Production build
