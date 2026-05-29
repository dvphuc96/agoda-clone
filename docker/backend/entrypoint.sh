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

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating APP_KEY..."
    php artisan key:generate --force
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Run seeders (only if database is empty)
HOTEL_COUNT=$(php artisan tinker --execute="echo App\Models\Hotel::count();" 2>/dev/null)
if [ "$HOTEL_COUNT" = "0" ]; then
    echo "Seeding database..."
    php artisan db:seed --force
else
    echo "Database already seeded ($HOTEL_COUNT hotels). Skipping."
fi

# Cache config in production
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

echo "GoStay backend is ready!"

exec "$@"
