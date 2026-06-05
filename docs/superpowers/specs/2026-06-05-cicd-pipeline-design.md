# GoStay — CI/CD Pipeline Design

**Date:** 2026-06-05
**Branch:** feature/polish-and-gaps (will be merged to master)
**Status:** Design approved, pending implementation plan

## Problem

Currently, deployment of GoStay is **manual and inconsistent**:

- Build artifacts (`public/assets/`, `public/index.html`) are committed to git, causing massive repo bloat and noisy `git status` output.
- No automated test/build gate before code reaches production.
- No reliable rollback mechanism if a deployment breaks production.
- No staging or production server provisioned yet — the project has never been deployed.
- Risk of "forgot to build on server" if artifacts were gitignored without automation.

We need a CI/CD pipeline that:
1. Runs tests and builds on every push to `master`.
2. Deploys automatically to a production EC2 instance.
3. Provides atomic, rollback-capable releases.
4. Keeps secrets (DB password, APP_KEY, payment gateway keys) strictly on the server.
5. Costs under ~$20/month for the MVP stage.

## Decision

Adopt **GitHub Actions + SSH deploy with symlink-based releases** on a single AWS EC2 instance running Ubuntu 24.04 with native PHP-FPM + Nginx + MySQL.

## Architecture

### Server Topology

**Single EC2 `t3.small`** in `ap-southeast-1` (Singapore):

| Component | Role |
|---|---|
| Nginx | Reverse proxy + serve static files (`public/assets/`, `public/index.html`) |
| PHP-FPM 8.3 | Run Laravel backend |
| MySQL 8.0 | Application database (bind localhost only) |
| Node.js 22 | Used during deploy to build Vite artifacts (no runtime role) |
| Supervisor | Run Laravel queue worker |
| Certbot | SSL certificate (Let's Encrypt, free) |

**Security groups**:
- Port 22 (SSH): restricted to GitHub Actions (via published IP ranges or SSH key only)
- Port 80/443 (HTTP/HTTPS): public
- Port 3306 (MySQL): localhost only (no inbound)

**Directory layout on EC2** (`/var/www/gostay/`):

```
/var/www/gostay/
├── releases/                              # each deploy = 1 dir
│   ├── 2026-06-05-15-30-abc123/
│   └── 2026-06-05-14-00-def456/
├── shared/                                # persists across releases
│   ├── .env                               # APP_KEY, DB creds, VNPAY/MOMO keys
│   └── storage/                           # Laravel storage (logs, sessions, uploads)
└── current -> releases/2026-06-05-15-30-abc123   # atomic-swap symlink
```

**Retention**: keep only **2 releases** (current + previous). Older releases auto-deleted after each successful deploy.

### Pipeline Stages

GitHub-hosted Ubuntu runner, three sequential jobs:

#### Job 1: `test`
Fail-fast — if any step fails, pipeline halts and no deploy runs.

1. Checkout code
2. Setup PHP 8.3 + Node 22 + MySQL service container
3. `composer install` (cached)
4. `npm ci` (cached)
5. Copy `.env.example` → `.env` (test env)
6. `php artisan key:generate`
7. Run migrations on test DB
8. `composer test` (phpunit — or syntax check if no test suite yet)
9. `npm run lint` (eslint) and `npm run build` (TypeScript + Vite build)

#### Job 2: `build`
Only runs if `test` passed.

1. `composer install --no-dev --optimize-autoloader` (production deps)
2. `npm ci && npm run build` (Vite output → `public/`)
3. Create tar artifact excluding `node_modules/`, `.git/`, `.env`, `tests/`, `phpunit.xml`
4. Upload to GitHub Actions artifact store (1-day retention)

#### Job 3: `deploy`
Only runs if `build` passed.

1. SSH into EC2 as `deploy` user
2. Pre-deploy: `mysqldump` → `/var/backups/gostay/pre-deploy-<timestamp>.sql` (keep 7)
3. Create release dir `/var/www/gostay/releases/<timestamp>-<sha>/`
4. Download artifact from GitHub Actions runner → release dir
5. Symlink `shared/.env` → `release/.env`
6. Symlink `shared/storage` → `release/storage`
7. `php artisan migrate --force` (production migrations)
8. `php artisan config:cache && route:cache && view:cache`
9. **Atomic symlink swap**: `current` → new release
10. Reload PHP-FPM: `sudo systemctl reload php8.3-fpm`
11. Restart queue: `sudo supervisorctl restart all`
12. Cleanup: keep only 2 most recent releases, delete older

**Concurrency**: `max-parallel: 1` — only one deploy runs at a time. Newer pushes cancel in-progress deploys for the same ref.

### Trigger

- **Auto on push to `master`** (typically via PR merge from `feature/*` branches)
- **Manual** via GitHub UI (workflow_dispatch) — for emergency redeploys
- Feature branches only run `test` job, not `build`/`deploy`

### Secrets Management

**GitHub Secrets** (set once in repo Settings → Secrets and variables → Actions):

| Secret | Purpose |
|---|---|
| `EC2_HOST` | Public IP of EC2 instance |
| `EC2_USER` | `deploy` |
| `EC2_SSH_KEY` | PEM private key contents |
| `EC2_KNOWN_HOSTS` | Output of `ssh-keyscan <EC2_IP>` |
| `DISCORD_WEBHOOK_URL` | Optional deploy notifications |

**No DB credentials, APP_KEY, or payment gateway keys** ever live in GitHub.

**On EC2**: `shared/.env` is the source of truth. Readable only by `deploy:www-data` (mode 640). Updated manually via SSH when new env vars are introduced.

When a new env var is added to `.env.example` in repo, the deploy job's pre-check compares keys against `shared/.env` on server and **fails fast with a clear message** if a required key is missing — preventing silent breakage.

### Rollback

**Manual SSH procedure** (< 2 seconds):

```bash
ssh deploy@<EC2_HOST>
cd /var/www/gostay
./rollback.sh
```

`rollback.sh` swaps `current` symlink to the previous release directory and reloads PHP-FPM + Supervisor.

**Limitations** (documented):
- Rollback is **code-level only**. Database migrations are NOT reverted.
- Therefore migrations must be **backward-compatible**: add columns/tables freely; never drop or rename in the same release as the code that depends on the new schema. Drop in a follow-up release after the rollback window has passed.

### Backup Strategy

| Backup | Frequency | Retention | Location |
|---|---|---|---|
| MySQL dump | Daily 02:00 UTC via cron | 30 days | S3 bucket `gostay-backups/db/` |
| MySQL dump | Pre-deploy | 7 versions | EC2 local `/var/backups/gostay/` |
| EBS snapshot | Weekly (AWS Data Lifecycle Manager) | 4 weeks | AWS-managed |

Restore drill: documented runbook to restore from S3 dump in < 30 minutes.

### Server Bootstrap

**Userdata script** (auto-runs on EC2 first boot) installs:
- Nginx, PHP 8.3 + extensions (mysql, xml, curl, mbstring, zip, bcmath, gd, intl), MySQL 8.0, Supervisor, Redis (reserved for future), Node 22, Composer
- Creates `deploy` user with `www-data` group
- Creates `/var/www/gostay/{releases,shared}` directory tree
- Pre-creates `storage/` subdirs with correct perms
- Templates Nginx vhost, PHP-FPM pool, Supervisor config

**Manual one-time setup** (cannot be automated):
1. `mysql_secure_installation` — set root password
2. Create `gostay` DB + application user
3. Upload initial `shared/.env` (contains real APP_KEY + DB creds + payment keys)
4. Configure domain DNS → EC2 public IP
5. Run `certbot --nginx -d <domain>` for SSL
6. Populate GitHub Secrets (EC2_HOST, EC2_USER, EC2_SSH_KEY, EC2_KNOWN_HOSTS)

### Files to Add in Repo

```
.github/
└── workflows/
    ├── test.yml                # Job 1
    └── deploy.yml              # Jobs 2 + 3 (depends on test)
scripts/
└── server/
    ├── userdata.sh             # EC2 first-boot bootstrap
    ├── nginx.conf              # Nginx vhost template
    ├── php-fpm-pool.conf       # PHP-FPM pool config (deploy user)
    ├── supervisor.conf         # Queue worker config
    ├── deploy.sh               # Run on EC2 during deploy job
    ├── rollback.sh             # Run manually to rollback
    ├── env-check.sh            # Verify .env has all required keys
    └── backup-db.sh            # Cron daily backup script
docs/
└── runbooks/
    ├── deploy.md               # How to deploy / troubleshoot
    ├── rollback.md             # How to rollback
    └── restore-from-backup.md  # Disaster recovery
```

### `.gitignore` Changes

Add (so future builds don't pollute repo):
```
/public/index.html
/frontend/dist/
```

Existing entries already cover:
```
/public/build
/public/assets
```

One-time cleanup: `git rm --cached public/index.html` (and any other build artifacts already tracked). This is included as Step 1 of the implementation plan.

## Cost Estimate (Monthly)

| Item | Cost (ap-southeast-1) |
|---|---|
| EC2 `t3.small` (2 vCPU, 2GB) | ~$15.00 |
| EBS 30GB gp3 | ~$2.50 |
| S3 backup storage (~5GB) | ~$0.12 |
| Route53 hosted zone (optional) | $0.50 |
| Data transfer (<100GB egress) | Free tier |
| **Total** | **~$18/month** |

If using AWS Free Tier in first 12 months: `t3.micro` free → ~$3-5/month total.

## Risks & Mitigations

| Risk | Probability | Mitigation |
|---|---|---|
| `.env` drift between repo's `.env.example` and server's `shared/.env` | High | `env-check.sh` runs in deploy job, fails fast with diff |
| Migration fails mid-deploy → DB inconsistent | Medium | Pre-deploy `mysqldump`; Laravel runs migrations in transaction where possible |
| Build artifact accidentally includes secrets | Low | `.env` excluded from tar; double-check via tar listing in CI logs |
| EC2 hardware failure | Low | Weekly EBS snapshots + daily S3 dumps |
| GitHub Actions throttling (2000 min/mo free) | Medium | Each pipeline ~5-10 min → 200+ deploys/month fits easily |
| npm/composer cache miss → slow deploys | High | Use `actions/cache@v4` for both |
| Single-point-of-failure (no HA) | High (accepted) | Out-of-scope for MVP; accepted trade-off |
| `deploy` user compromised via GitHub | Low | Sudoers restricted to specific commands; `.env` not world-readable |

## Out of Scope (YAGNI for MVP)

The following are explicitly **not** included in this design:

- Multi-environment (staging/prod split)
- Auto-scaling, load balancer, multi-AZ
- CDN (CloudFront)
- Redis for cache/queue (using database driver)
- Monitoring/APM (Sentry, New Relic)
- Blue-green deployment
- Docker on production
- Multiple domains / wildcard SSL
- Feature flags / canary deploys

Each of these can be added later by modifying the workflow or adding AWS resources without rewriting the pipeline.

## Success Criteria

This design is complete when:

1. Push to `master` → code is live on EC2 within 5-10 minutes.
2. Failing test or build → no deploy occurs; GitHub UI shows clear error.
3. Runtime failure post-deploy → `./rollback.sh` returns to previous release in < 2 seconds.
4. EC2 catastrophic failure → restore from S3 daily dump in < 30 minutes.
5. Repo is clean — no build artifacts committed.
6. Monthly AWS bill stays under $20.
7. New env vars added to `.env.example` cause clear failure with remediation instructions until `shared/.env` is updated.

## Implementation Plan Reference

The detailed implementation plan will be written in a follow-up spec via the `writing-plans` skill. It will cover:

1. Repo cleanup (`git rm --cached` of tracked artifacts)
2. `.gitignore` update + commit
3. Workflow files (`test.yml`, `deploy.yml`)
4. Server bootstrap scripts (`scripts/server/*`)
5. Runbook docs (`docs/runbooks/*`)
6. Local validation steps
7. EC2 provisioning steps (manual, with screenshots/checkpoints)
8. First deploy verification
9. Rollback drill

## Open Questions

None at design time. Implementation will surface specific edge cases (e.g., exact Nginx config for SPA + Laravel routing, queue worker restart behavior) which will be addressed in the plan.
