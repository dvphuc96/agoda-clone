#!/usr/bin/env bash
# Atomic deploy for GoStay.
# Invoked by CI with: deploy.sh <artifact.tar.gz> <git-sha>
#
# Layout (after this script runs):
#   /var/www/gostay/releases/<timestamp>-<sha>/   <- new release (extracted here)
#   /var/www/gostay/shared/.env                   <- symlinked into release
#   /var/www/gostay/shared/storage/               <- symlinked into release
#   /var/www/gostay/current                       <- symlink to the new release

set -euo pipefail

ARTIFACT="${1:?usage: deploy.sh <artifact.tar.gz> <git-sha>}"
SHA="${2:?usage: deploy.sh <artifact.tar.gz> <git-sha>}"

DEPLOY_ROOT="/var/www/gostay"
RELEASES_DIR="$DEPLOY_ROOT/releases"
SHARED_DIR="$DEPLOY_ROOT/shared"
CURRENT_LINK="$DEPLOY_ROOT/current"
TIMESTAMP=$(date -u +"%Y-%m-%d-%H-%M-%S")
RELEASE_NAME="${TIMESTAMP}-${SHA:0:7}"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_NAME"
BACKUP_DIR="/var/backups/gostay"

# ----------------------------------------------------------------------------
# Pre-flight
# ----------------------------------------------------------------------------
if [ "$(id -un)" != "deploy" ]; then
  echo "::error:: deploy.sh must run as user 'deploy'"
  exit 1
fi

if [ ! -f "$ARTIFACT" ]; then
  echo "::error:: artifact not found: $ARTIFACT"
  exit 1
fi

mkdir -p "$RELEASES_DIR" "$SHARED_DIR" "$BACKUP_DIR"

# ----------------------------------------------------------------------------
# Step 1: Pre-deploy mysqldump (rollback safety net)
# ----------------------------------------------------------------------------
PRE_DUMP="$BACKUP_DIR/pre-deploy-$(date -u +%Y%m%d-%H%M%S).sql.gz"
echo "[1/9] Pre-deploy database dump → $PRE_DUMP"
mysqldump --single-transaction --routines --triggers \
  -u gostay -p"$(grep ^DB_PASSWORD= "$SHARED_DIR/.env" | cut -d= -f2-)" \
  gostay | gzip > "$PRE_DUMP"

# Keep only the 7 most recent pre-deploy dumps.
ls -t "$BACKUP_DIR"/pre-deploy-*.sql.gz | tail -n +8 | xargs -r rm -f

# ----------------------------------------------------------------------------
# Step 2: Extract artifact to new release dir
# ----------------------------------------------------------------------------
echo "[2/9] Extracting artifact → $RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
tar -xzf "$ARTIFACT" -C "$RELEASE_DIR"

# ----------------------------------------------------------------------------
# Step 3: env-check — refuse to deploy if shared/.env is missing keys
# ----------------------------------------------------------------------------
echo "[3/9] Verifying shared/.env has all keys from .env.example"
"$RELEASE_DIR/scripts/server/env-check.sh" "$RELEASE_DIR"

# ----------------------------------------------------------------------------
# Step 4: Symlink shared/.env and storage into the release
# ----------------------------------------------------------------------------
echo "[4/9] Symlinking shared/.env and shared/storage"
ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
rm -rf "$RELEASE_DIR/storage"
ln -sfn "$SHARED_DIR/storage" "$RELEASE_DIR/storage"

# Storage subdirs must exist in shared/ (created by userdata.sh).
# Ensure they exist if this is the first deploy after a manual wipe.
for sub in app public framework cache logs sessions views; do
  mkdir -p "$SHARED_DIR/storage/$sub"
done
mkdir -p "$SHARED_DIR/storage/framework/cache/data" \
         "$SHARED_DIR/storage/framework/sessions" \
         "$SHARED_DIR/storage/framework/views" \
         "$SHARED_DIR/storage/app/public" \
         "$SHARED_DIR/storage/logs"

# Ensure the public/storage symlink exists (Laravel's public disk).
ln -sfn "$SHARED_DIR/storage/app/public" "$RELEASE_DIR/public/storage"

# ----------------------------------------------------------------------------
# Step 5: Composer autoload (artifact already has vendor/ — but ensure opt)
# ----------------------------------------------------------------------------
echo "[5/9] Optimizing composer autoload"
cd "$RELEASE_DIR"
composer dump-autoload --no-dev --optimize --classmap-authoritative

# ----------------------------------------------------------------------------
# Step 6: Laravel cache warm-up
# ----------------------------------------------------------------------------
echo "[6/9] Caching config, routes, views, events"
php artisan config:cache --no-interaction
php artisan route:cache --no-interaction
php artisan view:cache --no-interaction
php artisan event:cache --no-interaction
php artisan storage:link --force --no-interaction || true

# ----------------------------------------------------------------------------
# Step 7: Run migrations (production, with force flag)
# ----------------------------------------------------------------------------
echo "[7/9] Running migrations"
php artisan migrate --force --no-interaction

# ----------------------------------------------------------------------------
# Step 8: Atomic symlink swap + reload services
# ----------------------------------------------------------------------------
echo "[8/9] Atomic symlink swap: current → $RELEASE_NAME"

# Atomic swap using mv -T (rename(2) syscall). The symlink is replaced in one step.
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK.new"
mv -Tf "$CURRENT_LINK.new" "$CURRENT_LINK"

# Reload PHP-FPM (clears opcache for the new release).
sudo /bin/systemctl reload php8.4-fpm

# Restart queue workers (so they pick up new code).
sudo /usr/bin/supervisorctl restart all

# ----------------------------------------------------------------------------
# Step 9: Cleanup — keep only the 2 most recent releases
# ----------------------------------------------------------------------------
echo "[9/9] Cleaning up old releases (keeping 2 most recent)"
ls -1t "$RELEASES_DIR" | tail -n +3 | while read -r old; do
  echo "  removing $old"
  rm -rf "$RELEASES_DIR/$old"
done

# Remove uploaded artifact from /tmp.
rm -f "$ARTIFACT"

echo ""
echo "✅ Deployed: $RELEASE_NAME"
echo "   Current → $CURRENT_LINK → $RELEASE_DIR"
echo "   Rollback: cd $DEPLOY_ROOT && ./scripts/rollback.sh"
