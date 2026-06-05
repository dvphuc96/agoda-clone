#!/usr/bin/env bash
# EC2 first-boot bootstrap for GoStay.
# Paste this into the launch wizard "User data" field.
# Runs as root, exactly once, on first boot of a new instance.

set -euo pipefail
exec > >(tee /var/log/userdata.log) 2>&1
echo "=== userdata start $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="

# ----------------------------------------------------------------------------
# 1. System update + base packages
# ----------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  curl wget gnupg lsb-release ca-certificates \
  software-properties-common apt-transport-https \
  unzip git rsync \
  ufw fail2ban \
  mysql-client

# ----------------------------------------------------------------------------
# 2. PHP 8.4 + extensions
# ----------------------------------------------------------------------------
add-apt-repository -y ppa:ondrej/php
apt-get update -y
apt-get install -y \
  php8.4-fpm php8.4-cli \
  php8.4-mysql php8.4-xml php8.4-curl php8.4-mbstring \
  php8.4-zip php8.4-bcmath php8.4-gd php8.4-intl \
  php8.4-readline php8.4-opcache php8.4-redis

# ----------------------------------------------------------------------------
# 3. Nginx
# ----------------------------------------------------------------------------
apt-get install -y nginx

# ----------------------------------------------------------------------------
# 4. MySQL 8.0 (community repo for explicit version control)
# ----------------------------------------------------------------------------
wget -q https://dev.mysql.com/get/mysql-apt-config_0.8.29-1_all.deb -O /tmp/mysql-apt.deb
DEBIAN_FRONTEND=noninteractive dpkg -i /tmp/mysql-apt.deb
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server

# ----------------------------------------------------------------------------
# 5. Node 22 via NodeSource
# ----------------------------------------------------------------------------
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# ----------------------------------------------------------------------------
# 6. Composer
# ----------------------------------------------------------------------------
EXPECTED_SIG="$(wget -qO- https://composer.github.io/installer.sig)"
wget -q https://getcomposer.org/installer -O /tmp/composer-setup.php
ACTUAL_SIG="$(php -r "echo hash_file('sha384', '/tmp/composer-setup.php');")"
if [ "$EXPECTED_SIG" != "$ACTUAL_SIG" ]; then
  echo "::error:: composer installer signature mismatch"
  exit 1
fi
php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer

# ----------------------------------------------------------------------------
# 7. Supervisor + Certbot + AWS CLI
# ----------------------------------------------------------------------------
apt-get install -y supervisor
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot
apt-get install -y awscli

# ----------------------------------------------------------------------------
# 8. Create 'deploy' user
# ----------------------------------------------------------------------------
if ! id -u deploy >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash --groups www-data deploy
fi

# ----------------------------------------------------------------------------
# 9. Setup /var/www/gostay directory tree
# ----------------------------------------------------------------------------
DEPLOY_ROOT="/var/www/gostay"
mkdir -p "$DEPLOY_ROOT"/{releases,shared/storage,scripts}

# Storage subdirs (Laravel expects these)
for sub in app public framework framework/cache framework/cache/data \
           framework/sessions framework/views logs sessions views; do
  mkdir -p "$DEPLOY_ROOT/shared/storage/$sub"
done

# Perms: deploy owns, www-data can read/write (storage has session files etc.)
chown -R deploy:www-data "$DEPLOY_ROOT"
chmod -R u=rwX,g=rwX,o= "$DEPLOY_ROOT"
chmod g+s "$DEPLOY_ROOT/shared/storage"  # new files inherit www-data group

# ----------------------------------------------------------------------------
# 10. Restricted sudoers for deploy user
# ----------------------------------------------------------------------------
cat > /etc/sudoers.d/deploy-gostay <<'EOF'
# Allow deploy user to reload PHP-FPM and restart supervisor — nothing else.
deploy ALL=(root) NOPASSWD: /bin/systemctl reload php8.4-fpm
deploy ALL=(root) NOPASSWD: /bin/systemctl restart php8.4-fpm
deploy ALL=(root) NOPASSWD: /bin/systemctl status php8.4-fpm
deploy ALL=(root) NOPASSWD: /usr/bin/supervisorctl restart *
deploy ALL=(root) NOPASSWD: /usr/bin/supervisorctl status
EOF
chmod 0440 /etc/sudoers.d/deploy-gostay
visudo -cf /etc/sudoers.d/deploy-gostay

# ----------------------------------------------------------------------------
# 11. PHP-FPM pool config — run as deploy:www-data
# ----------------------------------------------------------------------------
cat > /etc/php/8.4/fpm/pool.d/gostay.conf <<'EOF'
[gostay]
user = deploy
group = www-data
listen = /run/php/php8.4-fpm-gostay.sock
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 20
pm.start_servers = 4
pm.min_spare_servers = 2
pm.max_spare_servers = 6
php_admin_value[error_log] = /var/www/gostay/shared/storage/logs/php-fpm-error.log
php_admin_flag[log_errors] = on
php_admin_value[memory_limit] = 256M
php_admin_value[upload_max_filesize] = 20M
php_admin_value[post_max_size] = 25M
EOF

# ----------------------------------------------------------------------------
# 12. Supervisor config for Laravel queue worker
# ----------------------------------------------------------------------------
cat > /etc/supervisor/conf.d/gostay-worker.conf <<'EOF'
[program:gostay-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/gostay/current/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=deploy
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/gostay/shared/storage/logs/worker.log
stopwaitsecs=3600
EOF

# ----------------------------------------------------------------------------
# 13. Nginx vhost
# ----------------------------------------------------------------------------
cat > /etc/nginx/sites-available/gostay <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /var/www/gostay/current/public;
    index index.php index.html;

    client_max_body_size 25M;

    # Storage: Laravel's public disk (avatars, uploads)
    location /storage/ {
        alias /var/www/gostay/shared/storage/app/public/;
        access_log off;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Vite-built assets (CSS/JS with hashes)
    location /assets/ {
        access_log off;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback: serve index.html for client routes (React Router),
    # fall through to Laravel's index.php for /api/* and other server-side routes.
    location / {
        try_files $uri $uri/ /index.php?$query_string;
        # If the URI doesn't match a real file AND doesn't look like an API path,
        # serve the SPA shell.
        if (!-f $request_filename) {
            rewrite ^/(?!api|storage|assets|admin-api|sanctum) /index.html last;
        }
    }

    # Laravel API + PHP entry point
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.4-fpm-gostay.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF
ln -sf /etc/nginx/sites-available/gostay /etc/nginx/sites-enabled/gostay
rm -f /etc/nginx/sites-enabled/default

nginx -t

# ----------------------------------------------------------------------------
# 14. MySQL hardening
# ----------------------------------------------------------------------------
# Bind to localhost only — no remote access.
sed -i 's/^bind-address.*/bind-address = 127.0.0.1/' /etc/mysql/mysql.conf.d/mysqld.cnf

# ----------------------------------------------------------------------------
# 15. Firewall
# ----------------------------------------------------------------------------
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

# ----------------------------------------------------------------------------
# 16. Clone repo scripts (deploy.sh, rollback.sh, etc.) to /var/www/gostay/scripts
# ----------------------------------------------------------------------------
# The scripts/ directory is committed in the repo. We need them on the server
# BEFORE the first deploy (chicken-and-egg). Operator uploads them via SCP
# after first boot — see runbook docs/runbooks/deploy.md (Task 8).

# ----------------------------------------------------------------------------
# 17. Enable services on boot
# ----------------------------------------------------------------------------
systemctl enable nginx php8.4-fpm mysql supervisor
systemctl restart mysql
systemctl restart php8.4-fpm
systemctl restart nginx
systemctl restart supervisor

echo "=== userdata complete $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo ""
echo "NEXT STEPS (operator — see docs/runbooks/deploy.md):"
echo "  1. Run mysql_secure_installation"
echo "  2. Create gostay DB + user:"
echo "     CREATE DATABASE gostay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "     CREATE USER 'gostay'@'localhost' IDENTIFIED BY '<STRONG_PASSWORD>';"
echo "     GRANT ALL ON gostay.* TO 'gostay'@'localhost';"
echo "  3. Upload shared/.env (APP_KEY, DB creds, payment keys) — mode 640 deploy:www-data"
echo "  4. Upload scripts/server/*.sh to /var/www/gostay/scripts/ — chmod +x"
echo "  5. Point DNS to $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "  6. Run: sudo certbot --nginx -d <domain>"
echo "  7. Add GitHub Secrets (EC2_HOST, EC2_USER, EC2_SSH_KEY, EC2_KNOWN_HOSTS)"
