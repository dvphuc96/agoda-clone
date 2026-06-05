#!/usr/bin/env bash
# Rollback to the previous release. Code-level only — does NOT revert migrations.
#
# Usage:
#   ssh deploy@<host>
#   cd /var/www/gostay
#   ./scripts/rollback.sh              # rollback one release
#   ./scripts/rollback.sh --list       # show available releases

set -euo pipefail

DEPLOY_ROOT="/var/www/gostay"
RELEASES_DIR="$DEPLOY_ROOT/releases"
CURRENT_LINK="$DEPLOY_ROOT/current"

# --- list mode ---
if [ "${1:-}" = "--list" ]; then
  echo "Available releases (newest first):"
  ls -1t "$RELEASES_DIR"
  echo ""
  echo "Current → $(readlink "$CURRENT_LINK")"
  exit 0
fi

# --- find current and previous ---
if [ ! -L "$CURRENT_LINK" ]; then
  echo "::error:: current symlink does not exist at $CURRENT_LINK"
  exit 1
fi

CURRENT_REAL=$(readlink -f "$CURRENT_LINK")
CURRENT_NAME=$(basename "$CURRENT_REAL")

# List releases by mtime descending; skip the current one; take the next.
PREV_NAME=$(ls -1t "$RELEASES_DIR" | grep -v "^${CURRENT_NAME}$" | head -1 || true)

if [ -z "$PREV_NAME" ]; then
  echo "::error:: no previous release available to roll back to"
  echo "Releases present:"
  ls -1 "$RELEASES_DIR"
  exit 2
fi

PREV_DIR="$RELEASES_DIR/$PREV_NAME"

echo "Current release: $CURRENT_NAME"
echo "Rolling back to: $PREV_NAME"

# Confirm
read -p "Proceed? [y/N] " confirm
if [ "${confirm,,}" != "y" ]; then
  echo "Aborted."
  exit 0
fi

# --- atomic symlink swap ---
ln -sfn "$PREV_DIR" "$CURRENT_LINK.new"
mv -Tf "$CURRENT_LINK.new" "$CURRENT_LINK"

# --- reload services ---
sudo /bin/systemctl reload php8.4-fpm
sudo /usr/bin/supervisorctl restart all

echo ""
echo "✅ Rolled back to: $PREV_NAME"
echo "   Current → $CURRENT_LINK → $PREV_DIR"
echo ""
echo "Note: rollback is code-level only. Database migrations are NOT reverted."
echo "If the rolled-back release needs schema changes, restore from the latest"
echo "pre-deploy dump at /var/backups/gostay/ or S3."
