from datetime import date

import pytest
from django.core.management import call_command
from rest_framework.test import APIClient

from apps import policy
from apps.accounts.models import User
from apps.organization.models import OrganizationUnit

pytestmark = pytest.mark.django_db


@pytest.fixture
def seeded(db):
    call_command("seed_org_demo")


@pytest.fixture
def authed():
    user = User.objects.create_user(email="u@example.org", password=None, full_name="U")
    client = APIClient()
    client.force_authenticate(user)
    return client


def test_anonymous_is_denied_everywhere(seeded):
    client = APIClient()
    for url in ("/api/v1/org/units/", "/api/v1/org/units/1/", "/api/v1/org/units/1/history/"):
        assert client.get(url).status_code in (401, 403)


def test_authenticated_user_sees_nothing_until_roles_exist(seeded, authed):
    """2.2 ships deny-by-default policy; scope rules arrive in 2.3."""
    assert authed.get("/api/v1/org/units/").json()["results"] == []
    unit = OrganizationUnit.objects.get(code="demo-root")
    assert authed.get(f"/api/v1/org/units/{unit.pk}/").status_code == 404
    assert authed.get(f"/api/v1/org/units/{unit.pk}/history/").status_code == 404


def test_invalid_as_of_is_a_400(seeded, authed):
    r = authed.get("/api/v1/org/units/?as_of=2025-13-40")
    assert r.status_code == 400 and "as_of" in r.json()


@pytest.fixture
def open_policy(monkeypatch):
    """Simulate a fully-permitted caller to exercise the data path without roles."""
    monkeypatch.setattr(policy, "scope_queryset", lambda user, qs: qs)


def test_as_of_listing_reflects_history(seeded, authed, open_policy):
    def names(as_of):
        data = authed.get(f"/api/v1/org/units/?as_of={as_of}").json()["results"]
        return {row["code"]: row for row in data}

    before, after = names("2025-01-01"), names("2025-09-01")
    assert before["demo-faculty-a"]["name"] == "Sinov fakulteti A"
    assert after["demo-faculty-a"]["name"] == "Sinov fakulteti A (yangi nom)"
    fac_a = OrganizationUnit.objects.get(code="demo-faculty-a").pk
    fac_b = OrganizationUnit.objects.get(code="demo-faculty-b").pk
    assert before["demo-dept-2"]["parent_id"] == fac_a
    assert after["demo-dept-2"]["parent_id"] == fac_b
    assert names("2020-01-01") == {}


def test_default_as_of_is_today_and_shape_is_minimal(seeded, authed, open_policy):
    rows = authed.get("/api/v1/org/units/").json()["results"]
    assert {r["code"] for r in rows} >= {"demo-root", "demo-faculty-a"}
    assert set(rows[0]) == {
        "id",
        "code",
        "name",
        "unit_type",
        "parent_id",
        "valid_from",
        "valid_to",
    }


def test_history_lists_all_versions_oldest_first(seeded, authed, open_policy):
    fac_a = OrganizationUnit.objects.get(code="demo-faculty-a")
    rows = authed.get(f"/api/v1/org/units/{fac_a.pk}/history/").json()["results"]
    assert [r["valid_from"] for r in rows] == ["2024-09-01", "2025-09-01"]
    assert rows[0]["valid_to"] == "2025-09-01" and rows[1]["valid_to"] is None


def test_detail_honours_as_of_and_unknown_is_404(seeded, authed, open_policy):
    unit = OrganizationUnit.objects.get(code="demo-faculty-a")
    old = authed.get(f"/api/v1/org/units/{unit.pk}/?as_of=2025-01-01").json()
    assert old["name"] == "Sinov fakulteti A"
    assert authed.get("/api/v1/org/units/999999/").status_code == 404
    assert authed.get(f"/api/v1/org/units/{unit.pk}/?as_of=2020-01-01").status_code == 404


def test_api_is_read_only(seeded, authed, open_policy):
    assert authed.post("/api/v1/org/units/", {}, format="json").status_code == 405
    assert authed.delete("/api/v1/org/units/1/").status_code == 405


def test_seed_is_idempotent_and_synthetic(db):
    call_command("seed_org_demo")
    call_command("seed_org_demo")
    assert OrganizationUnit.objects.count() == 6
    assert set(OrganizationUnit.objects.values_list("code", flat=True)) == {
        "demo-root",
        "demo-faculty-a",
        "demo-faculty-b",
        "demo-dept-1",
        "demo-dept-2",
        "demo-center",
    }
    assert date.today().year >= 2024  # sanity: dates in the seed are fixed, not "today"
