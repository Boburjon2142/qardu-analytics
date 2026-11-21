from unittest.mock import patch

from rest_framework.test import APIClient
from rest_framework.views import APIView


def test_health_ok():
    r = APIClient().get("/api/v1/health/")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_version():
    r = APIClient().get("/api/v1/version/")
    assert r.status_code == 200
    assert r.json() == {"api_version": "v1", "app_version": "0.1.0"}


def test_ready_returns_503_without_leaking_details_when_db_down():
    with patch("apps.core.views.connection.cursor", side_effect=RuntimeError("secret dsn")):
        r = APIClient().get("/api/v1/health/ready/")
    assert r.status_code == 503
    assert r.json() == {"status": "unavailable"}
    assert "secret" not in r.content.decode()


def test_ready_ok_when_db_up():
    with patch("apps.core.views.connection.cursor"):
        r = APIClient().get("/api/v1/health/ready/")
    assert r.status_code == 200


def test_post_not_allowed():
    assert APIClient().post("/api/v1/health/").status_code == 405


def test_default_policy_is_deny():
    """A view that does not opt in must be denied (no auth exists yet)."""
    from rest_framework.response import Response
    from rest_framework.test import APIRequestFactory

    class Plain(APIView):
        def get(self, request):
            return Response({"leak": True})

    r = Plain.as_view()(APIRequestFactory().get("/x"))
    assert r.status_code in (401, 403)
