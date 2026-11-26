"""Shared fixtures: the synthetic demo hierarchy plus helpers for grants and API clients.

Demo structure (seed_org_demo, all fictional):
    demo-root (university)
    ├── demo-faculty-a ── demo-dept-1           (demo-dept-2 here until 2025-09-01)
    ├── demo-faculty-b ── demo-dept-2           (from 2025-09-01)
    └── demo-center
"""

from datetime import date

import pytest
from django.core.cache import cache
from django.core.management import call_command
from rest_framework.test import APIClient

from apps.access.services import assign_role, assign_supervision
from apps.accounts.models import User
from apps.organization.models import OrganizationUnit

PAST = date(2025, 1, 1)


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def org(db):
    call_command("seed_org_demo")
    return {u.code.removeprefix("demo-"): u for u in OrganizationUnit.objects.all()}


@pytest.fixture
def make_user(db):
    counter = iter(range(1, 1000))

    def _make(name="user", active=True):
        n = next(counter)
        return User.objects.create_user(
            email=f"{name}{n}@example.org", password=None, full_name=name, is_active=active
        )

    return _make


@pytest.fixture
def grant():
    """Grant a role directly through the service (bootstrap path, may backdate)."""

    def _grant(user, role, unit=None, valid_from=PAST, valid_to=None):
        return assign_role(
            user=user,
            role=role,
            unit=unit,
            valid_from=valid_from,
            valid_to=valid_to,
            backdate_allowed=True,
        )

    return _grant


@pytest.fixture
def supervise():
    def _supervise(user, unit, valid_from=PAST, valid_to=None):
        return assign_supervision(
            user=user, unit=unit, valid_from=valid_from, valid_to=valid_to, backdate_allowed=True
        )

    return _supervise


@pytest.fixture
def client_for():
    def _client(user):
        client = APIClient()
        client.force_authenticate(user)
        return client

    return _client
