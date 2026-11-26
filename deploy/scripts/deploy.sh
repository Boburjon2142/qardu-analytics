#!/usr/bin/env bash
# Build and activate a release of QarDU Analytics on this server.
# Usage: sudo bash /var/www/qardu/src/deploy/scripts/deploy.sh [git-ref]   (default: origin/main)
#
# Layout:  /var/www/qardu/src            pristine build checkout (never edit by hand)
#          /var/www/qardu/releases/<ts>  immutable release: api/ (+ .venv) and web/ (standalone)
#          /var/www/qardu/current        symlink to the active release (used by systemd)
#
# Steps: fetch -> build API + web into a new release -> Django deploy checks -> (if migrations
# are pending: show plan, pg_dump backup, ask for confirmation, migrate) -> switch symlink ->
# restart -> health check (automatic code rollback on failure) -> prune old releases.
# Database migrations are never reverted automatically; restore from the pre-deploy backup.
set -Eeuo pipefail

APP_ROOT=/var/www/qardu
SRC=$APP_ROOT/src
ENV_FILE=/etc/qardu/api.env
BACKUP_DIR=/var/backups/qardu
REPO_URL=${REPO_URL:-https://github.com/Boburjon2142/qardu-analytics.git}
DOMAIN=${DOMAIN:-stat.qarshidu.uz}
PYTHON=${PYTHON:-python3.14}
KEEP_RELEASES=${KEEP_RELEASES:-5}
REF=${1:-origin/main}

log() { printf '\n==> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "run as root (sudo)."
[[ -f $ENV_FILE ]] || die "$ENV_FILE is missing; run deploy/scripts/server-setup.sh first."
id qardu >/dev/null 2>&1 || die "user 'qardu' is missing; run server-setup.sh first."

# Run manage.py inside a release as the service user, with the production environment only.
manage() {
    local release=$1; shift
    runuser -u qardu -- env -i PATH=/usr/local/bin:/usr/bin:/bin HOME=/tmp bash -c \
        'set -a; . "$0"; set +a; cd "$1/api"; shift; exec .venv/bin/python manage.py "$@"' \
        "$ENV_FILE" "$release" "$@"
}

healthy() {
    local i
    for i in $(seq 1 30); do
        if curl -fsS -o /dev/null -H "Host: $DOMAIN" -H "X-Forwarded-Proto: https" \
                http://127.0.0.1:8100/api/v1/health/ready/ \
            && curl -fsS -o /dev/null http://127.0.0.1:3100/; then
            return 0
        fi
        sleep 2
    done
    return 1
}

command -v "$PYTHON" >/dev/null || die "$PYTHON not found; run deploy/scripts/install-python.sh."
# Resolve to the real interpreter so release venvs never point through /root or a shim.
PYTHON_BIN=$(readlink -f "$(command -v "$PYTHON")")
runuser -u qardu -- "$PYTHON_BIN" -c 'import venv' 2>/dev/null \
    || die "user qardu cannot run $PYTHON_BIN; re-run deploy/scripts/install-python.sh."
if (( $(awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo) < 1500 )); then
    echo "WARNING: less than 1.5 GB RAM available; the Next.js build may fail or slow other sites."
fi

log "Source ($REF)"
[[ -d $SRC/.git ]] || git clone --quiet "$REPO_URL" "$SRC"
git -C "$SRC" fetch --quiet --prune origin
COMMIT=$(git -C "$SRC" rev-parse --verify "$REF^{commit}")
git -C "$SRC" checkout --quiet --force --detach "$COMMIT"
RELEASE=$APP_ROOT/releases/$(date +%Y%m%d-%H%M%S)-${COMMIT:0:7}
mkdir -p "$RELEASE"
echo "commit $COMMIT -> $RELEASE"

log "API build"
rsync -a --delete \
    --exclude '.venv/' --exclude '.env' --exclude '__pycache__/' \
    --exclude '.pytest_cache/' --exclude '.ruff_cache/' \
    "$SRC/apps/api/" "$RELEASE/api/"
"$PYTHON_BIN" -m venv "$RELEASE/api/.venv"
"$RELEASE/api/.venv/bin/pip" install --quiet --upgrade pip
"$RELEASE/api/.venv/bin/pip" install --quiet -r "$RELEASE/api/requirements/prod.txt"
"$RELEASE/api/.venv/bin/python" -m compileall -q "$RELEASE/api/apps" "$RELEASE/api/config"

log "Web build"
(
    cd "$SRC/apps/web"
    npm ci --no-audit --no-fund --loglevel=error
    NEXT_TELEMETRY_DISABLED=1 npm run build
)
mkdir -p "$RELEASE/web/.next"
cp -a "$SRC/apps/web/.next/standalone/." "$RELEASE/web/"
cp -a "$SRC/apps/web/.next/static" "$RELEASE/web/.next/static"
cp -a "$SRC/apps/web/public" "$RELEASE/web/public"
[[ -f $RELEASE/web/server.js ]] || die "standalone build has no server.js"

# Code is read-only for the service user; only Next's runtime cache is writable.
chown -R root:qardu "$RELEASE"
chmod -R u=rwX,g=rX,o= "$RELEASE"
mkdir -p "$RELEASE/web/.next/cache"
chown qardu:qardu "$RELEASE/web/.next/cache"
chmod 755 "$APP_ROOT/releases" && chmod 750 "$RELEASE"

log "Django deploy checks"
manage "$RELEASE" check --deploy --fail-level WARNING

log "Database migrations"
PLAN=$(manage "$RELEASE" migrate --plan)
if grep -q "No planned migration operations" <<<"$PLAN"; then
    echo "none pending"
else
    echo "$PLAN"
    DB_NAME=$(set -a; . "$ENV_FILE"; printf '%s' "$POSTGRES_DB")
    BACKUP=$BACKUP_DIR/predeploy-$(date +%Y%m%d-%H%M%S)-${COMMIT:0:7}.dump
    runuser -u postgres -- pg_dump -Fc "$DB_NAME" >"$BACKUP"
    chmod 600 "$BACKUP"
    echo "backup: $BACKUP"
    if [[ ${ASSUME_YES:-} != yes ]]; then
        read -r -p "Apply the migrations above? [y/N] " answer
        [[ $answer == [yY] ]] || die "aborted; release built but NOT activated: $RELEASE"
    fi
    manage "$RELEASE" migrate --noinput
fi

log "Activate"
PREVIOUS=$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)
ln -sfn "$RELEASE" "$APP_ROOT/current.new" && mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"
systemctl restart qardu-api qardu-web

log "Health check"
if ! healthy; then
    if [[ -n $PREVIOUS && -d $PREVIOUS ]]; then
        ln -sfn "$PREVIOUS" "$APP_ROOT/current.new" && mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"
        systemctl restart qardu-api qardu-web
        die "new release unhealthy; code rolled back to $PREVIOUS (migrations NOT reverted).
See: journalctl -u qardu-api -u qardu-web -n 100"
    fi
    die "first release is unhealthy. See: journalctl -u qardu-api -u qardu-web -n 100"
fi

log "Prune old releases (keep $KEEP_RELEASES)"
ACTIVE=$(readlink -f "$APP_ROOT/current")
find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d | sort -r | tail -n +"$((KEEP_RELEASES + 1))" |
    while read -r old; do [[ $old == "$ACTIVE" ]] || rm -rf -- "$old"; done

curl -fsS -o /dev/null "https://$DOMAIN/api/v1/health/" \
    && echo "public check OK: https://$DOMAIN" \
    || echo "WARNING: https://$DOMAIN is not reachable from this host (DNS/TLS/firewall?)"
log "Deployed ${COMMIT:0:7}"
