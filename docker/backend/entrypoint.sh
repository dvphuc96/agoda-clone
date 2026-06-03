#!/bin/sh
set -e

# Fix storage permissions
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
until php artisan db:show 2>/dev/null; do
    sleep 1
    echo "  MySQL is unavailable - retrying..."
done
echo "MySQL is up!"

# Ensure exactly one valid APP_KEY in .env
if grep -q "^APP_KEY=base64:[A-Za-z0-9+/=]*base64:" .env 2>/dev/null; then
    echo "Fixing corrupted APP_KEY in .env..."
    FIRST_KEY=$(grep "^APP_KEY=" .env | head -1 | grep -oE "base64:[A-Za-z0-9+/=]+" | head -1)
    sed -i '/^APP_KEY=/d' .env
    echo "APP_KEY=${FIRST_KEY}" >> .env
elif ! grep -q "^APP_KEY=base64:[A-Za-z0-9+/=]\{20,\}$" .env 2>/dev/null; then
    echo "Generating APP_KEY..."
    php artisan key:generate --force
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Run seeders (only if database is empty)
LOCATION_COUNT=$(php artisan tinker --execute="echo App\Models\Location::count();" 2>/dev/null || echo "0")
if [ "$LOCATION_COUNT" = "0" ]; then
    echo "Seeding database..."
    php artisan db:seed --force
else
    echo "Database already seeded ($LOCATION_COUNT locations). Skipping."
fi

# Cache config in production
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

echo "GoStay backend is ready!"

exec "$@"
