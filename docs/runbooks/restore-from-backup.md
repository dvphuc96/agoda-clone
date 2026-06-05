# Restore from Backup Runbook

How to recover the database from a nightly S3 dump or a pre-deploy local dump.

## Backup sources

| Source | Frequency | Location | Retention |
|---|---|---|---|
| Pre-deploy local dump | Every deploy | `/var/backups/gostay/pre-deploy-*.sql.gz` | 7 versions |
| Nightly S3 dump | Daily 02:00 UTC | `s3://gostay-backups/db/*.sql.gz` | 30 days (S3 lifecycle) |

## When to restore

- Catastrophic EC2 failure requiring new instance.
- Corrupted database (failed migration, accidental DELETE/DROP).
- Rollback is insufficient because the destructive change already happened.

## Estimated time

- Pre-deploy local dump: **5-10 minutes**.
- S3 dump on existing EC2: **15-30 minutes** depending on dump size.
- Full disaster recovery on new EC2: **30-60 minutes** (includes provisioning).

## Restore from pre-deploy local dump (fastest)

Use when the EC2 instance is fine but you need to undo a recent migration.

```bash
ssh deploy@<EC2_HOST>

# List available dumps
ls -lh /var/backups/gostay/pre-deploy-*.sql.gz

# Pick the one you want (newest is usually correct)
DUMP=/var/backups/gostay/pre-deploy-2026-06-05-100000.sql.gz

# Stop workers so they don't write while restoring
sudo supervisorctl stop all

# Drop and recreate to ensure clean state
DB_PASS=$(grep ^DB_PASSWORD= /var/www/gostay/shared/.env | cut -d= -f2-)
mysql -u gostay -p"$DB_PASS" gostay -e "SET FOREIGN_KEY_CHECKS=0; SHOW TABLES" | tail -n +2 | xargs -I{} mysql -u gostay -p"$DB_PASS" gostay -e "DROP TABLE {}"
mysql -u gostay -p"$DB_PASS" gostay -e "SET FOREIGN_KEY_CHECKS=1"

# Restore
gunzip -c "$DUMP" | mysql -u gostay -p"$DB_PASS" gostay

# Restart workers
sudo supervisorctl start all
```

## Restore from S3 (EC2 instance still alive)

Use when local dumps don't go back far enough.

```bash
ssh deploy@<EC2_HOST>

# List S3 dumps (newest first)
aws s3 ls s3://gostay-backups/db/ --recursive | sort -r | head -10

# Download
DUMP_FILE=gostay-2026-06-04-020000.sql.gz
aws s3 cp "s3://gostay-backups/db/$DUMP_FILE" "/tmp/$DUMP_FILE"

# Stop workers, drop tables, restore (same pattern as above)
sudo supervisorctl stop all

DB_PASS=$(grep ^DB_PASSWORD= /var/www/gostay/shared/.env | cut -d= -f2-)
mysql -u gostay -p"$DB_PASS" gostay -e "SET FOREIGN_KEY_CHECKS=0; SHOW TABLES" | tail -n +2 | xargs -I{} mysql -u gostay -p"$DB_PASS" gostay -e "DROP TABLE {}"
mysql -u gostay -p"$DB_PASS" gostay -e "SET FOREIGN_KEY_CHECKS=1"

gunzip -c "/tmp/$DUMP_FILE" | mysql -u gostay -p"$DB_PASS" gostay

sudo supervisorctl start all
```

## Disaster recovery on a NEW EC2 instance

Use when the original EC2 is gone.

1. **Launch new EC2** with the same `userdata.sh` (Task 6). Wait for first-boot to complete (~10 min).
2. **Skip the `mysql_secure_installation`** — instead, immediately restore the latest S3 dump.
3. **Update DNS** to point to the new EC2 public IP.
4. **Re-run Certbot** for SSL: `sudo certbot --nginx -d <domain>`.
5. **Update GitHub Secrets** with the new EC2_HOST and EC2_KNOWN_HOSTS.
6. **Trigger a deploy** via GitHub UI (workflow_dispatch on `deploy.yml`).

## Verify restore

After restoring:

```bash
# Sanity checks
mysql -u gostay -p"$DB_PASS" gostay -e "SELECT COUNT(*) FROM users"
mysql -u gostay -p"$DB_PASS" gostay -e "SELECT COUNT(*) FROM hotels"
mysql -u gostay -p"$DB_PASS" gostay -e "SELECT COUNT(*) FROM bookings"

# App-level check
curl -s https://<domain>/api/health | jq
```

## Pitfalls

- **Order matters:** stop workers BEFORE restoring. Otherwise they'll write to partially-restored tables.
- **FOREIGN_KEY_CHECKS=0** during drop is essential — otherwise DROP fails on referenced tables.
- **Don't forget to RE-ENABLE** FK checks before the restore (the dump file itself may have SET commands, but be explicit).
- **Verify the dump is recent enough** — if the last nightly was 23 hours ago, you lose up to 23 hours of writes. Pre-deploy dumps are typically more recent.
