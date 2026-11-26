#!/usr/bin/env bash
# Switch `current` back to the previous release (or a named one) and restart the services.
# Usage: sudo bash deploy/scripts/rollback.sh [release-dir-name]
# Code only: database migrations are NOT reverted. If the newer release applied migrations the
# older code cannot handle, restore the matching /var/backups/qardu/predeploy-*.dump instead.
set -Eeuo pipefail

APP_ROOT=/var/www/qardu
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[[ $EUID -eq 0 ]] || die "run as root (sudo)."

ACTIVE=$(readlink -f "$APP_ROOT/current") || die "no active release"
if [[ -n ${1:-} ]]; then
    TARGET=$APP_ROOT/releases/$1
else
    # Newest release that is older than the active one (names start with a timestamp).
    TARGET=$(find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d | sort |
        awk -v active="$ACTIVE" '$0 < active' | tail -n 1)
fi
[[ -n $TARGET && -d $TARGET ]] || die "no release to roll back to"

ln -sfn "$TARGET" "$APP_ROOT/current.new" && mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"
systemctl restart qardu-api qardu-web
echo "current -> $TARGET (was $ACTIVE)"
