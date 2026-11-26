"""ADMIN API for grants: only technical administrators, validated, audited (negative test #4)."""

from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.access.models import Role, RoleAssignment, SupervisionScope
from apps.audit.models import AuditEvent

pytestmark = pytest.mark.django_db

ROLES = "/api/v1/access/role-assignments/"
SCOPES = "/api/v1/access/supervision-scopes/"


@pytest.fixture
def admin(make_user, grant):
    user = make_user("admin")
    grant(user, Role.TECH_ADMIN)
    return user


@pytest.fixture
def admin_client(admin, client_for):
    return client_for(admin)


def test_anonymous_is_denied(org):
    client = APIClient()
    for url in (ROLES, SCOPES, "/api/v1/access/me/"):
        assert client.get(url).status_code in (401, 403)
    assert client.post(ROLES, {}, format="json").status_code in (401, 403)


@pytest.mark.parametrize("role", [Role.RECTOR, Role.VICE_RECTOR, Role.PUBLISHER])
def test_non_admin_roles_cannot_manage_access(org, make_user, grant, client_for, role):
    user = make_user()
    grant(user, role)
    target = make_user()
    client = client_for(user)
    assert client.get(ROLES).status_code == 403
    r = client.post(ROLES, {"user_id": target.pk, "role": "rector"}, format="json")
    assert r.status_code == 403
    assert not RoleAssignment.objects.filter(user=target).exists()
    assert AuditEvent.objects.filter(action="access.manage", outcome="denied", actor=user).exists()


def test_admin_grants_dean_role_and_dean_gains_scope(
    org, admin, admin_client, make_user, client_for
):
    dean = make_user("dean")
    r = admin_client.post(
        ROLES, {"user_id": dean.pk, "role": "dean", "unit_id": org["faculty-a"].pk}, format="json"
    )
    assert r.status_code == 201, r.json()
    body = r.json()
    assert body["role"] == "dean" and body["assigned_by_id"] == admin.pk
    assert body["valid_from"] == timezone.localdate().isoformat() and body["valid_to"] is None
    assert AuditEvent.objects.filter(
        action="access.role.assign", actor=admin, object_id=str(body["id"])
    ).exists()
    rows = client_for(dean).get("/api/v1/org/units/").json()["results"]
    assert {row["code"] for row in rows} == {"demo-root", "demo-faculty-a", "demo-dept-1"}


@pytest.mark.parametrize("role", [Role.RECTOR, Role.TECH_ADMIN, Role.VICE_RECTOR])
def test_admin_cannot_grant_a_role_to_themselves(org, admin, admin_client, role):
    """Negative test #4 (P2-6)."""
    r = admin_client.post(ROLES, {"user_id": admin.pk, "role": role}, format="json")
    assert r.status_code == 400
    assert RoleAssignment.objects.filter(user=admin).count() == 1  # only the bootstrap grant


def test_admin_cannot_add_supervision_scope_for_themselves(org, admin, admin_client):
    r = admin_client.post(SCOPES, {"user_id": admin.pk, "unit_id": org["center"].pk}, format="json")
    assert r.status_code == 400


@pytest.mark.parametrize(
    ("role", "unit", "reason"),
    [
        ("dean", None, "requires a unit"),
        ("dean", "dept-1", "cannot be attached"),
        ("unit_head", "faculty-a", "cannot be attached"),
        ("rector", "faculty-a", "must not have a unit"),
    ],
)
def test_role_and_unit_must_match(org, admin_client, make_user, role, unit, reason):
    payload = {"user_id": make_user().pk, "role": role}
    if unit:
        payload["unit_id"] = org[unit].pk
    r = admin_client.post(ROLES, payload, format="json")
    assert r.status_code == 400 and reason in str(r.json())


def test_grants_cannot_be_backdated_via_api(org, admin_client, make_user):
    yesterday = timezone.localdate() - timedelta(days=1)
    r = admin_client.post(
        ROLES,
        {"user_id": make_user().pk, "role": "rector", "valid_from": yesterday.isoformat()},
        format="json",
    )
    assert r.status_code == 400 and "past" in str(r.json())


def test_overlapping_duplicate_grant_is_rejected(org, admin_client, make_user):
    user = make_user()
    payload = {"user_id": user.pk, "role": "rector"}
    assert admin_client.post(ROLES, payload, format="json").status_code == 201
    r = admin_client.post(ROLES, payload, format="json")
    assert r.status_code == 400 and "overlapping" in str(r.json())


def test_inactive_or_unknown_user_cannot_receive_a_grant(org, admin_client, make_user):
    inactive = make_user(active=False)
    for user_id in (inactive.pk, 999999):
        r = admin_client.post(ROLES, {"user_id": user_id, "role": "rector"}, format="json")
        assert r.status_code == 400


def test_revoke_ends_the_role_today(org, admin, admin_client, make_user, client_for):
    user = make_user()
    created = admin_client.post(ROLES, {"user_id": user.pk, "role": "rector"}, format="json").json()
    assert client_for(user).get("/api/v1/org/units/").json()["results"]
    r = admin_client.post(f"{ROLES}{created['id']}/revoke/", {}, format="json")
    assert r.status_code == 200
    assert r.json()["valid_to"] == timezone.localdate().isoformat()
    assert client_for(user).get("/api/v1/org/units/").json()["results"] == []
    assert AuditEvent.objects.filter(action="access.role.revoke", actor=admin).exists()
    # Revoking again cannot extend or re-open the grant.
    assert (
        admin_client.post(f"{ROLES}{created['id']}/revoke/", {}, format="json").status_code == 400
    )


def test_revoke_cannot_be_retroactive(org, admin_client, make_user, grant):
    assignment = grant(make_user(), Role.RECTOR)
    yesterday = (timezone.localdate() - timedelta(days=1)).isoformat()
    r = admin_client.post(f"{ROLES}{assignment.pk}/revoke/", {"valid_to": yesterday}, format="json")
    assert r.status_code == 400


def test_revoking_a_future_grant_cancels_it(org, admin_client, make_user):
    start = timezone.localdate() + timedelta(days=10)
    created = admin_client.post(
        ROLES,
        {"user_id": make_user().pk, "role": "rector", "valid_from": start.isoformat()},
        format="json",
    ).json()
    r = admin_client.post(f"{ROLES}{created['id']}/revoke/", {}, format="json")
    assert r.status_code == 200
    assert r.json()["valid_to"] == r.json()["valid_from"]  # empty range: never active


def test_revoke_unknown_grant_is_404(org, admin_client):
    assert admin_client.post(f"{ROLES}999999/revoke/", {}, format="json").status_code == 404


def test_supervision_scope_lifecycle_via_api(org, admin, admin_client, make_user, client_for):
    vr = make_user("vr")
    admin_client.post(ROLES, {"user_id": vr.pk, "role": "vice_rector"}, format="json")
    r = admin_client.post(SCOPES, {"user_id": vr.pk, "unit_id": org["center"].pk}, format="json")
    assert r.status_code == 201
    scope_id = r.json()["id"]
    codes = {row["code"] for row in client_for(vr).get("/api/v1/org/units/").json()["results"]}
    assert codes == {"demo-root", "demo-center"}
    assert admin_client.post(f"{SCOPES}{scope_id}/revoke/", {}, format="json").status_code == 200
    assert client_for(vr).get("/api/v1/org/units/").json()["results"] == []
    assert SupervisionScope.objects.get(pk=scope_id).valid_to == timezone.localdate()


def test_list_filters_by_user_and_active_date(org, admin, admin_client, make_user, grant):
    user = make_user()
    grant(user, Role.UNIT_HEAD, org["dept-1"], valid_to=timezone.localdate())
    grant(user, Role.UNIT_HEAD, org["center"])
    rows = admin_client.get(f"{ROLES}?user={user.pk}").json()["results"]
    assert len(rows) == 2
    today = timezone.localdate().isoformat()
    rows = admin_client.get(f"{ROLES}?user={user.pk}&active_on={today}").json()["results"]
    assert [row["unit_id"] for row in rows] == [org["center"].pk]
    assert admin_client.get(f"{ROLES}?user=abc").status_code == 400
    assert admin_client.get(f"{ROLES}?active_on=2025-13-01").status_code == 400


def test_grants_cannot_be_edited_or_deleted_via_api(org, admin_client, make_user, grant):
    assignment = grant(make_user(), Role.RECTOR)
    for method in ("put", "patch", "delete"):
        response = getattr(admin_client, method)(f"{ROLES}{assignment.pk}/", {}, format="json")
        assert response.status_code in (404, 405)
        assert getattr(admin_client, method)(ROLES, {}, format="json").status_code == 405


def test_me_lists_only_own_active_grants(org, make_user, grant, supervise, client_for):
    user = make_user()
    grant(user, Role.VICE_RECTOR)
    grant(user, Role.UNIT_HEAD, org["dept-1"], valid_to=timezone.localdate())  # expired
    supervise(user, org["center"])
    grant(make_user(), Role.RECTOR)  # someone else
    body = client_for(user).get("/api/v1/access/me/").json()
    assert body == {
        "roles": [{"role": "vice_rector", "unit_id": None}],
        "supervised_unit_ids": [org["center"].pk],
    }
