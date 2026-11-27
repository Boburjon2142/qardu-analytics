"""Throttle counters live in PostgreSQL, so every gunicorn worker sees the same counts."""

import pytest
from django.conf import settings
from django.core.cache.backends.db import DatabaseCache


def _db_cache():
    cfg = settings.CACHES["default"]
    return DatabaseCache(cfg["LOCATION"], cfg)


def test_default_cache_is_database_backed():
    assert settings.CACHES["default"]["BACKEND"] == "django.core.cache.backends.db.DatabaseCache"


@pytest.mark.django_db
def test_separate_cache_instances_share_state():
    # Two backend instances stand in for two worker processes.
    worker_a, worker_b = _db_cache(), _db_cache()
    worker_a.set("throttle_login_account_x", [1.0, 2.0, 3.0], 60)
    assert worker_b.get("throttle_login_account_x") == [1.0, 2.0, 3.0]
