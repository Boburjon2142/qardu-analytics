#!/usr/bin/env bash
# Run a Django management command in the active release, as the service user, with the
# production environment. Examples:
#   sudo bash deploy/scripts/manage.sh createuser --email admin@qarshidu.uz --full-name "Ism Familiya"
#   sudo bash deploy/scripts/manage.sh assignrole --email admin@qarshidu.uz --role tech_admin
#   sudo bash deploy/scripts/manage.sh showmigrations
set -Eeuo pipefail

APP_ROOT=/var/www/qardu
ENV_FILE=/etc/qardu/api.env
[[ $EUID -eq 0 ]] || { echo "run as root (sudo)." >&2; exit 1; }
[[ $# -gt 0 ]] || { echo "usage: $0 <manage.py command> [args...]" >&2; exit 1; }

exec runuser -u qardu -- env -i PATH=/usr/local/bin:/usr/bin:/bin HOME=/tmp bash -c \
    'set -a; . "$0"; set +a; cd "$1/api"; shift; exec .venv/bin/python manage.py "$@"' \
    "$ENV_FILE" "$APP_ROOT/current" "$@"
