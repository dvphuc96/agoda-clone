#!/usr/bin/env bash
# Compares keys between repo's .env.example and server's shared/.env.
# Fails fast with a diff if any required key is missing on the server.
# Run BEFORE extracting the new release.

set -euo pipefail

REPO_DIR="${1:-$(pwd)}"
SHARED_ENV="/var/www/gostay/shared/.env"
ENV_EXAMPLE="$REPO_DIR/.env.example"

if [ ! -f "$ENV_EXAMPLE" ]; then
  echo "::error:: .env.example not found at $ENV_EXAMPLE"
  exit 1
fi

if [ ! -f "$SHARED_ENV" ]; then
  echo "::error:: shared/.env not found at $SHARED_ENV"
  echo "Create it manually with APP_KEY, DB creds, and payment gateway keys."
  exit 1
fi

# Extract keys (ignore comments and blanks). Keys are everything before the first '='.
example_keys=$(grep -E '^[A-Z_]+=' "$ENV_EXAMPLE" | cut -d= -f1 | sort -u)
shared_keys=$(grep -E '^[A-Z_]+=' "$SHARED_ENV" | cut -d= -f1 | sort -u)

# Find keys present in .env.example but missing from shared/.env.
missing=$(comm -23 <(echo "$example_keys") <(echo "$shared_keys"))

if [ -n "$missing" ]; then
  echo "::error:: shared/.env is missing the following keys:"
  echo "$missing" | sed 's/^/  - /'
  echo ""
  echo "Update /var/www/gostay/shared/.env on the server and re-run deploy."
  echo "DO NOT commit secrets to the repo."
  exit 2
fi

empty_values=0
while IFS= read -r key; do
  # Check if the value after '=' is empty or just whitespace.
  value=$(grep -E "^${key}=" "$SHARED_ENV" | head -1 | cut -d= -f2-)
  if [ -z "${value// }" ]; then
    echo "::warning:: $key is set but empty in shared/.env"
    empty_values=$((empty_values + 1))
  fi
done <<< "$example_keys"

if [ "$empty_values" -gt 0 ]; then
  echo "::warning:: $empty_values keys have empty values. Verify this is intentional."
fi

echo "env-check OK: all keys present in shared/.env"
