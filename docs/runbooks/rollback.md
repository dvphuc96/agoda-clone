# Rollback Runbook

How to revert to the previous release when a deploy breaks production.

## Speed

Rollback completes in < 2 seconds of actual downtime (the symlink swap + PHP-FPM reload). Total time including SSH is ~30 seconds.

## When to roll back

- A new deploy causes 500 errors or broken core flows (login, booking, payment).
- A migration fails mid-deploy and leaves the app in a broken state.
- A regression is reported within minutes of deploy.

## When NOT to roll back (use other tools instead)

- Performance is slow but functional → investigate, don't roll back.
- One specific feature is broken but rest works → hotfix forward if simple.
- DB migration was destructive (column dropped) → rollback won't help; see `restore-from-backup.md`.

## Procedure

```bash
ssh deploy@<EC2_HOST>
cd /var/www/gostay
./scripts/rollback.sh
```

The script will:
1. Show current and previous release names.
2. Ask for confirmation (`y/N`).
3. Atomic-swap the `current` symlink to the previous release.
4. Reload PHP-FPM (clears opcache).
5. Restart supervisor (queue workers pick up old code).

## Listing available releases

```bash
ssh deploy@<EC2_HOST> /var/www/gostay/scripts/rollback.sh --list
```

## What rollback does NOT do

- **Database schema is NOT reverted.** Migrations are one-way.
- **Session data is preserved** (lives in `shared/storage/`).
- **Uploaded files are preserved** (same reason).

## Migration safety rules

Because rollback is code-level only, migrations must be backward-compatible:

| OK in same release as code change | Requires two-phase release |
|---|---|
| Add column | Drop column |
| Add table | Rename column/table |
| Add index | Change column type |
| Insert seed data | Drop table |

For destructive changes:
1. **Release N:** ship the new code that doesn't depend on the schema change yet.
2. **Release N+1:** ship the migration after release N has been live long enough that you won't roll back past it (typically 24-48 hours).

## Rollback limits

We keep only the 2 most recent releases. If the previous release is also broken, you must restore from S3 nightly backup (see `restore-from-backup.md`).

## After rolling back

1. Acknowledge the incident (Discord, etc.).
2. Identify the root cause from logs:
   - `tail -100 /var/www/gostay/shared/storage/logs/laravel.log`
   - `tail -100 /var/log/nginx/error.log`
3. Fix the broken commit, push a new deploy. Don't leave production on the rolled-back release longer than necessary — it lacks any fixes that landed between the previous release and the failed one.
