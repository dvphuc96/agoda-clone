#!/usr/bin/env bash
# Nightly DB backup to local disk + S3. Run via cron at 02:00 UTC.
#
# Crontab entry (deploy user):
#   0 2 * * * /var/www/gostay/scripts/backup-db.sh >> /var/log/gostay-backup.log 2>&1
#
# Requires: aws CLI configured (IAM user with s3:PutObject on the bucket).
# S3 lifecycle policy on the bucket: expire objects under db/ after 30 days.

set -euo pipefail

DEPLOY_ROOT="/var/www/gostay"
SHARED_DIR="$DEPLOY_ROOT/shared"
BACKUP_DIR="/var/backups/gostay"
S3_BUCKET="${S3_BUCKET:-gostay-backups}"  # override via env if needed
S3_PREFIX="db"

# Load DB creds from shared/.env (sourced safely — only DB_* keys).
DB_NAME=$(grep ^DB_DATABASE= "$SHARED_DIR/.env" | cut -d= -f2-)
DB_USER=$(grep ^DB_USERNAME= "$SHARED_DIR/.env" | cut -d= -f2-)
DB_PASS=$(grep ^DB_PASSWORD= "$SHARED_DIR/.env" | cut -d= -f2-)

if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
  echo "::error:: could not read DB_DATABASE/DB_USERNAME from $SHARED_DIR/.env"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%d-%H%M%S")
DUMP_FILE="$BACKUP_DIR/gostay-${TIMESTAMP}.sql.gz"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting backup"

# 1. Local dump
echo "  → dumping to $DUMP_FILE"
mysqldump --single-transaction --routines --triggers \
  -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$DUMP_FILE"

DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "  ✓ local dump: $DUMP_SIZE"

# 2. Upload to S3
S3_URI="s3://${S3_BUCKET}/${S3_PREFIX}/$(basename "$DUMP_FILE")"
echo "  → uploading to $S3_URI"
if aws s3 cp "$DUMP_FILE" "$S3_URI" --no-progress; then
  echo "  ✓ uploaded"
else
  echo "::error:: S3 upload failed — local dump preserved at $DUMP_FILE"
  exit 2
fi

# 3. Prune local dumps older than 14 days (S3 lifecycle handles the 30-day retention).
find "$BACKUP_DIR" -name "gostay-*.sql.gz" -mtime +14 -delete
echo "  ✓ pruned local dumps older than 14 days"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Backup complete"
