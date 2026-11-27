"""Base settings. Environment-specific modules (local, test) extend this.

Phase 2.1: custom User (email login), DB-backed sessions, CSRF, login throttling,
audit trail. Roles/scopes/organization arrive in later milestones.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def env_bool(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str) -> list[str]:
    return [v.strip() for v in os.environ.get(name, "").split(",") if v.strip()]


SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]  # required; no hardcoded fallback
DEBUG = env_bool("DJANGO_DEBUG", False)
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS")
CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS")

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.sessions",
    "django.contrib.postgres",
    "rest_framework",
    "apps.core",
    "apps.accounts",
    "apps.audit",
    "apps.organization",
    "apps.access",
]

MIDDLEWARE = [
    "apps.core.middleware.RequestIDMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "apps.accounts.middleware.AbsoluteSessionTimeoutMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB", "qardu_analytics"),
        "USER": os.environ.get("POSTGRES_USER", ""),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", ""),
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
        "CONN_MAX_AGE": 60,
    }
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "accounts.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 12},  # Proposed (G6/P2-5)
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Sessions: DB-backed, 30 min idle (sliding) + 12 h absolute (middleware). Proposed (P2-5).
SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_COOKIE_AGE = 30 * 60
SESSION_SAVE_EVERY_REQUEST = True
SESSION_ABSOLUTE_AGE = 12 * 60 * 60
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = env_bool("DJANGO_COOKIE_SECURE", not DEBUG)
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = env_bool("DJANGO_COOKIE_SECURE", not DEBUG)
CSRF_FAILURE_VIEW = "apps.core.views.csrf_failure"

# Login throttle counters must be shared by every gunicorn worker and survive restarts, so the
# cache lives in PostgreSQL (no extra service). The table is created by apps/core migration 0001.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.db.DatabaseCache",
        "LOCATION": "qardu_cache",
        "OPTIONS": {"MAX_ENTRIES": 10000},
    }
}

LANGUAGE_CODE = "en-us"
# The university's calendar day: role validity, `as_of` defaults and effective dates all use
# timezone.localdate(). Timestamps are still stored in UTC (USE_TZ).
TIME_ZONE = "Asia/Tashkent"
USE_TZ = True

REST_FRAMEWORK = {
    # Deny by default: every endpoint must opt in explicitly (e.g. health).
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
    # 0 = trust only REMOTE_ADDR; X-Forwarded-For is spoofable. Revisit behind Nginx.
    "NUM_PROXIES": int(os.environ.get("DRF_NUM_PROXIES", "0")),
    # Proposed values (P2-5). The per-IP limit is higher because many users share a NAT.
    "DEFAULT_THROTTLE_RATES": {"login_account": "5/min", "login_ip": "30/min"},
}

APP_VERSION = "0.1.0"
