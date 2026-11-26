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

if [[ -x $LINK ]] && "$LINK" -c 'import venv, ssl, sqlite3' 2>/dev/null; then
    echo "OK: $("$LINK" --version) already installed at $LINK"
    exit 0
fi

if ! command -v uv >/dev/null; then
    # Official installer; puts a single static binary into /usr/local/bin, no shell rc edits.
    curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR=/usr/local/bin UV_NO_MODIFY_PATH=1 sh
fi

install -d -m 755 "$INSTALL_DIR"
UV_PYTHON_INSTALL_DIR=$INSTALL_DIR uv python install "$VERSION"
PY=$(UV_PYTHON_INSTALL_DIR=$INSTALL_DIR UV_PYTHON_PREFERENCE=only-managed uv python find "$VERSION")
[[ -x $PY ]] || die "uv did not produce a Python $VERSION interpreter"
chmod -R a+rX "$INSTALL_DIR"   # the service user must be able to run it
ln -sfn "$PY" "$LINK"

"$LINK" -c 'import venv, ssl, sqlite3' || die "the installed Python is missing core modules"
echo "OK: $("$LINK" --version) -> $LINK"
