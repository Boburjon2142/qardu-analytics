"""Production settings: HTTPS behind Nginx (stat.qarshidu.uz). Values come from the environment
(systemd EnvironmentFile, see deploy/api.env.example); nothing secret lives in this file.

Fails fast on missing or placeholder configuration instead of starting insecurely.
"""

import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403
from .base import ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS, SECRET_KEY

DEBUG = False

if len(SECRET_KEY) < 50 or SECRET_KEY.startswith(("change-me", "<", "test-only")):
    raise ImproperlyConfigured("DJANGO_SECRET_KEY must be a real secret of 50+ characters.")
if not ALLOWED_HOSTS or "*" in ALLOWED_HOSTS:
    raise ImproperlyConfigured("DJANGO_ALLOWED_HOSTS must list the real host name(s).")
if not all(origin.startswith("https://") for origin in CSRF_TRUSTED_ORIGINS):
    raise ImproperlyConfigured("DJANGO_CSRF_TRUSTED_ORIGINS must be https:// origins.")
_db_password = os.environ.get("POSTGRES_PASSWORD", "")
if not _db_password or _db_password.startswith(("change-me", "<")):
    raise ImproperlyConfigured("POSTGRES_PASSWORD must be set to a real password.")

# TLS terminates at Nginx, which overwrites X-Forwarded-Proto (never passes the client's value).
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True  # Nginx already redirects; this guards against a misrouted request.
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"
# HSTS is sent by Nginx for the whole site (one place, one value); avoid a duplicate header here.
SECURE_HSTS_SECONDS = 0
SILENCED_SYSTEM_CHECKS = ["security.W004"]

DATABASES["default"]["CONN_HEALTH_CHECKS"] = True  # noqa: F405

# Logs go to stdout/stderr -> journald. No request bodies, cookies or headers are logged.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"plain": {"format": "%(levelname)s %(name)s %(message)s"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "plain"}},
    "root": {"handlers": ["console"], "level": "WARNING"},
    "loggers": {
        "django": {"handlers": ["console"], "level": "WARNING", "propagate": False},
    },
}
