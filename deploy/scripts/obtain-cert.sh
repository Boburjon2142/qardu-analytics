#!/usr/bin/env bash
# Obtain a Let's Encrypt certificate for the domain and install the full Nginx site.
# Usage: sudo bash deploy/scripts/obtain-cert.sh <contact-email>
# Prerequisite: DNS A/AAAA record of the domain points to this server; ports 80/443 open.
set -Eeuo pipefail

DOMAIN=${DOMAIN:-stat.qarshidu.uz}
EMAIL=${1:-}
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SITE=/etc/nginx/sites-available/$DOMAIN.conf

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[[ $EUID -eq 0 ]] || die "run as root (sudo)."
[[ -n $EMAIL ]] || die "usage: $0 <contact-email for certificate expiry notices>"

install -d -m 755 /var/www/certbot

if [[ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]]; then
    # Temporary HTTP-only site so the ACME challenge can be answered before a certificate exists.
    cat >"$SITE" <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 404; }
}
NGINX
    ln -sfn "$SITE" "/etc/nginx/sites-enabled/$DOMAIN.conf"
    nginx -t && systemctl reload nginx
    certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" \
        --email "$EMAIL" --agree-tos --no-eff-email --non-interactive
fi

install -m 644 "$REPO_DIR/deploy/nginx/$DOMAIN.conf" "$SITE"
ln -sfn "$SITE" "/etc/nginx/sites-enabled/$DOMAIN.conf"
nginx -t && systemctl reload nginx

# Reload Nginx after every automatic renewal (certbot's systemd timer handles renewals).
install -d /etc/letsencrypt/renewal-hooks/deploy
cat >/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'HOOK'
#!/bin/sh
systemctl reload nginx
HOOK
chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

echo "OK: https://$DOMAIN is configured. Test renewal with: certbot renew --dry-run"
