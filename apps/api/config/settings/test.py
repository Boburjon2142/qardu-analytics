import os
from pathlib import Path

from ._env import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")
os.environ.setdefault("DJANGO_SECRET_KEY", "test-only-not-a-secret")

from .base import *  # noqa: E402, F403

DEBUG = False
ALLOWED_HOSTS = ["testserver"]
# Fast hasher for tests only; production keeps Django's default (PBKDF2).
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
# Tests use the same DatabaseCache as production (base.py). Throttle state does not leak between
# tests: the autouse `_clear_cache` fixtures clear it and each test's transaction is rolled back.
