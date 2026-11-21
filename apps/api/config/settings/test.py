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
# Cache-backed throttles must not leak between tests.
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
