#!/usr/bin/env bash
# Install a standalone CPython for QarDU Analytics on hosts whose system Python is too old
# (e.g. Ubuntu 20.04 ships 3.8; Django 6.1 needs >= 3.12). Idempotent.
# Usage: sudo bash deploy/scripts/install-python.sh
#
# Uses uv (Astral) to place a self-contained CPython under /opt/python and links it as
# /usr/local/bin/python3.14. The system `python3`, apt and other sites are not touched.
set -Eeuo pipefail

VERSION=${PYTHON_VERSION:-3.14}   # keep in line with CI (.github/workflows/ci.yml)
INSTALL_DIR=/opt/python
LINK=/usr/local/bin/python$VERSION

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[[ $EUID -eq 0 ]] || die "run as root (sudo)."

# Usable = resolves inside $INSTALL_DIR (never under /root) and runs for an unprivileged user.
usable() {
    [[ -x $LINK ]] || return 1
    [[ $(readlink -f "$LINK") == "$INSTALL_DIR"/* ]] || return 1
    runuser -u nobody -- "$LINK" -c 'import venv, ssl, sqlite3' 2>/dev/null
}

if usable; then
    echo "OK: $("$LINK" --version) already installed: $LINK -> $(readlink -f "$LINK")"
    exit 0
fi

if ! command -v uv >/dev/null; then
    # Official installer; puts a single static binary into /usr/local/bin, no shell rc edits.
    curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR=/usr/local/bin UV_NO_MODIFY_PATH=1 sh
fi

install -d -m 755 "$INSTALL_DIR"
UV_PYTHON_INSTALL_DIR=$INSTALL_DIR uv python install "$VERSION"
# Link the real binary inside $INSTALL_DIR. (`uv python find` may return a shim under
# /root/.local/bin, which the service user cannot traverse.)
PY=$(find "$INSTALL_DIR" -mindepth 3 -maxdepth 3 -type f -name "python$VERSION" \
    -path "*/cpython-$VERSION.*/bin/*" | sort -V | tail -n 1)
[[ -n $PY && -x $PY ]] || die "no Python $VERSION binary found under $INSTALL_DIR"
chmod -R a+rX "$INSTALL_DIR"   # the service user must be able to run it
ln -sfn "$PY" "$LINK"

usable || die "$LINK -> $(readlink -f "$LINK") is not runnable by an unprivileged user"
echo "OK: $("$LINK" --version): $LINK -> $PY"
