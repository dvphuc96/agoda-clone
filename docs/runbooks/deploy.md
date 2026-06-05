# Deploy Runbook

How to deploy GoStay to production. Most deploys are automatic — this runbook covers manual scenarios.

## Automatic deploys (default)

Push or merge to `master`. GitHub Actions runs `test.yml` then `deploy.yml`. The whole flow takes 5-10 minutes.

Monitor: GitHub Actions tab → "deploy" workflow.

## Manual redeploy (same commit)

Use when you need to push the same SHA again (e.g., after fixing a server-side env var).

1. GitHub UI → Actions → "deploy" → "Run workflow" → select branch `master`.
2. Watch the run finish.

## Manual deploy from your laptop (emergency)

If GitHub Actions is down but you have SSH access:

```bash
# On your laptop, from the repo root:
rtk npm run build                          # regenerate public/index.html
tar -czf /tmp/gostay-manual.tar.gz \
  --exclude='.git' --exclude='node_modules' \
  --exclude='.env' --exclude='.env.*' \
  --exclude='tests' --exclude='phpunit.xml' \
  --exclude='frontend/node_modules' \
  .

scp /tmp/gostay-manual.tar.gz deploy@<EC2_HOST>:/tmp/
ssh deploy@<EC2_HOST>
  sudo /var/www/gostay/scripts/deploy.sh /tmp/gostay-manual.tar.gz $(git rev-parse --short HEAD)
```

## First-time EC2 setup (after `userdata.sh` runs)

Run these once. They CANNOT be automated because they require secrets.

```bash
ssh ubuntu@<EC2_HOST>

# 1. MySQL hardening
sudo mysql_secure_installation

# 2. Create DB + user
sudo mysql <<'SQL'
CREATE DATABASE gostay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gostay'@'localhost' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL ON gostay.* TO 'gostay'@'localhost';
FLUSH PRIVILEGES;
SQL

# 3. Upload initial shared/.env (from your laptop, contains real secrets)
# On laptop:
scp .env.production deploy@<EC2_HOST>:/tmp/.env.upload
ssh deploy@<EC2_HOST>
  sudo mv /tmp/.env.upload /var/www/gostay/shared/.env
  sudo chown deploy:www-data /var/www/gostay/shared/.env
  sudo chmod 640 /var/www/gostay/shared/.env

# 4. Upload deploy scripts (from repo to server, once)
scp scripts/server/*.sh deploy@<EC2_HOST>:/tmp/
ssh deploy@<EC2_HOST>
  sudo mv /tmp/*.sh /var/www/gostay/scripts/
  sudo chmod +x /var/www/gostay/scripts/*.sh

# 5. Configure domain + SSL
sudo certbot --nginx -d gostay.example.com

# 6. Set up GitHub Secrets (in repo UI):
#    EC2_HOST, EC2_USER=deploy, EC2_SSH_KEY (PEM contents), EC2_KNOWN_HOSTS
#    Run: ssh-keyscan -H <EC2_HOST>   # paste output as EC2_KNOWN_HOSTS

# 7. Set up nightly backup cron (as deploy user)
crontab -e
# add: 0 2 * * * /var/www/gostay/scripts/backup-db.sh >> /var/log/gostay-backup.log 2>&1

# 8. Set up S3 lifecycle policy (one-time, in AWS console)
#    S3 → bucket "gostay-backups" → Management → Lifecycle rule:
#      - prefix: db/
#      - expire after 30 days
```

## Troubleshooting

| Symptom | Check |
|---|---|
| Build fails in CI | `composer.lock` or `frontend/package-lock.json` not committed? |
| Deploy uploads but site is blank | Check `/var/www/gostay/current` symlink exists and points to a valid release |
| 502 Bad Gateway | PHP-FPM down: `sudo systemctl status php8.4-fpm`. Check `/var/www/gostay/shared/storage/logs/php-fpm-error.log` |
| 500 on `/api/*` | Check Laravel log: `tail /var/www/gostay/shared/storage/logs/laravel.log` |
| Migrations didn't run | Re-run: `php /var/www/gostay/current/artisan migrate --force` |
| Permission denied on storage | `sudo chown -R deploy:www-data /var/www/gostay/shared/storage` |
| env-check fails | Add missing keys to `/var/www/gostay/shared/.env`. See diff in CI log. |

## Escalation

If the automated deploy is broken and the manual deploy also fails:
1. Roll back to the previous release: see `rollback.md`.
2. If rollback fails (rare), restore the last known-good release from S3 nightly backup: see `restore-from-backup.md`.
