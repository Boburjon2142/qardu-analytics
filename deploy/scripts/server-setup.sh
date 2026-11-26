#!/usr/bin/env bash
# One-time server preparation for QarDU Analytics (Ubuntu 20.04/22.04/24.04). Idempotent.
# Run from a checkout of the repository:  sudo bash deploy/scripts/server-setup.sh
#
# What it does: installs only *missing* basic tools, service user, directories,
# /etc/qardu/api.env skeleton, PostgreSQL role + database (no superuser/CREATEDB), systemd units.
# It does NOT install or upgrade PostgreSQL/Nginx (shared hosts may run other sites on them),
# deploy code, obtain certificates or touch other Nginx sites.
# Old system Python (Ubuntu 20.04)? Run deploy/scripts/install-python.sh first.
set -Eeuo pipefail

APP_ROOT=/var/www/qardu
PYTHON=${PYTHON:-python3.14}
ENV_FILE=/etc/qardu/api.env
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

log() { printf '\n==> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "run as root (sudo)."

log "Prerequisites"
for tool in nginx psql certbot; do
    command -v "$tool" >/dev/null || die "$tool is not installed. Install it deliberately (on a
shared host, check which version the other sites use) and re-run."
done
(( $(psql --version | grep -oE '[0-9]+' | head -1) >= 14 )) || die "PostgreSQL >= 14 is required."
MISSING=()
for tool in git rsync curl; do command -v "$tool" >/dev/null || MISSING+=("$tool"); done
if (( ${#MISSING[@]} )); then
    apt-get update -q && apt-get install -y -q "${MISSING[@]}"
fi

command -v "$PYTHON" >/dev/null || die "$PYTHON not found. Run deploy/scripts/install-python.sh."
PY_OK=$("$PYTHON" -c 'import sys; print(int(sys.version_info >= (3, 12)))')
[[ $PY_OK == 1 ]] || die "Python >= 3.12 is required (Django 6.1). Found: $("$PYTHON" --version)"

if ! command -v node >/dev/null || (( $(node -p 'process.versions.node.split(".")[0]') < 20 )); then
    die "Node.js >= 20 (recommended 24 LTS) is required. Install it from https://nodejs.org or
the NodeSource repository, then re-run this script."
fi

log "Service user and directories"
id qardu >/dev/null 2>&1 || useradd --system --home-dir "$APP_ROOT" --shell /usr/sbin/nologin qardu
install -d -m 755 -o root -g root "$APP_ROOT" "$APP_ROOT/releases" /var/www/certbot
install -d -m 750 -o root -g qardu /etc/qardu
install -d -m 700 -o root -g root /var/backups/qardu

if [[ ! -f $ENV_FILE ]]; then
    install -m 640 -o root -g qardu "$REPO_DIR/deploy/api.env.example" "$ENV_FILE"
    die "Created $ENV_FILE from the template. Fill in every <generate> value, then re-run."
fi
chown root:qardu "$ENV_FILE" && chmod 640 "$ENV_FILE"
grep -q '<generate>' "$ENV_FILE" && die "$ENV_FILE still contains <generate> placeholders."

log "PostgreSQL role and database"
# Read DB settings in a subshell so nothing else from the file leaks into this script.
read -r DB_NAME DB_USER < <(set -a; . "$ENV_FILE"; printf '%s %s\n' "$POSTGRES_DB" "$POSTGRES_USER")
DB_PASS=$(set -a; . "$ENV_FILE"; printf '%s' "$POSTGRES_PASSWORD")
[[ $DB_NAME =~ ^[a-z_][a-z0-9_]*$ && $DB_USER =~ ^[a-z_][a-z0-9_]*$ ]] \
    || die "POSTGRES_DB/POSTGRES_USER must match [a-z_][a-z0-9_]*"
# The password travels on stdin only (never argv, so it is not visible in `ps`).
SQL_PASS=${DB_PASS//\'/\'\'}
runuser -u postgres -- psql -v ON_ERROR_STOP=1 -q -d postgres <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE $DB_USER LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD '$SQL_PASS';
  ELSE
    ALTER ROLE $DB_USER LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD '$SQL_PASS';
  END IF;
END \$\$;
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER ENCODING ''UTF8'' TEMPLATE template0'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME') \gexec
REVOKE ALL ON DATABASE $DB_NAME FROM PUBLIC;
SQL
unset DB_PASS SQL_PASS

log "systemd units"
install -m 644 "$REPO_DIR"/deploy/systemd/qardu-api.service /etc/systemd/system/
install -m 644 "$REPO_DIR"/deploy/systemd/qardu-web.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable qardu-api qardu-web >/dev/null

log "Done. Next: deploy/scripts/obtain-cert.sh, then deploy/scripts/deploy.sh"
