import secrets

import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.accounts.models import User


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def password():
    # Random per test run; never a fixed credential.
    return "Pw-" + secrets.token_urlsafe(18)


@pytest.fixture
def user(db, password):
    return User.objects.create_user(
        email="Alice@Example.org", password=password, full_name="Alice Test"
    )


@pytest.fixture
def client():
    """Client that enforces CSRF like a real browser."""
    return APIClient(enforce_csrf_checks=True)


def csrf_headers(client):
    client.get("/api/v1/auth/csrf/")
    return {"HTTP_X_CSRFTOKEN": client.cookies["csrftoken"].value}


@pytest.fixture
def login(client, password):
    def _login(email="alice@example.org", pwd=None):
        headers = csrf_headers(client)
        return client.post(
            "/api/v1/auth/login/",
            {"email": email, "password": pwd if pwd is not None else password},
            format="json",
            **headers,
        )

    return _login
