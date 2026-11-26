"""Organization scope per role, through the real API (negative tests #1, #2, #5, #6)."""

import time
from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps import policy
from apps.access.models import Role
from apps.accounts.middleware import SESSION_STARTED_KEY

pytestmark = pytest.mark.django_db


def visible_codes(client, as_of=None):
    url = "/api/v1/org/units/" + (f"?as_of={as_of}" if as_of else "")
    response = client.get(url)
    assert response.status_code == 200
    return {row["code"].removeprefix("demo-") for row in response.json()["results"]}


ALL_UNITS = {"root", "faculty-a", "faculty-b", "dept-1", "dept-2", "center"}


@pytest.mark.parametrize("role", [Role.RECTOR, Role.TECH_ADMIN, Role.ORG_STRUCTURE_APPROVER])
def test_whole_tree_roles_see_every_unit(org, make_user, grant, client_for, role):
    user = make_user()
    grant(user, role)
    assert visible_codes(client_for(user)) == ALL_UNITS


def test_dean_sees_own_faculty_subtree_plus_breadcrumb(org, make_user, grant, client_for):
    dean = make_user("dean")
    grant(dean, Role.DEAN, org["faculty-b"])
    # Today dept-2 belongs to faculty B; root is visible only as the breadcrumb.
    assert visible_codes(client_for(dean)) == {"root", "faculty-b", "dept-2"}


def test_dean_scope_follows_the_structure_of_the_as_of_date(org, make_user, grant, client_for):
    dean = make_user("dean")
    grant(dean, Role.DEAN, org["faculty-b"])
    # Before 2025-09-01 dept-2 was still under faculty A.
    assert visible_codes(client_for(dean), "2025-01-01") == {"root", "faculty-b"}


def test_other_faculty_dean_gets_404_for_detail_and_history(org, make_user, grant, client_for):
    """Negative test #1."""
    dean = make_user("dean")
    grant(dean, Role.DEAN, org["faculty-b"])
    client = client_for(dean)
    for code in ("faculty-a", "dept-1", "center"):
        pk = org[code].pk
        assert client.get(f"/api/v1/org/units/{pk}/").status_code == 404
        assert client.get(f"/api/v1/org/units/{pk}/history/").status_code == 404
    own = org["faculty-b"].pk
    assert client.get(f"/api/v1/org/units/{own}/").status_code == 200
    assert client.get(f"/api/v1/org/units/{own}/history/").status_code == 200


def test_breadcrumb_ancestor_is_readable_but_its_history_is_not(org, make_user, grant, client_for):
    dean = make_user("dean")
    grant(dean, Role.DEAN, org["faculty-b"])
    client = client_for(dean)
    root = org["root"].pk
    assert client.get(f"/api/v1/org/units/{root}/").status_code == 200
    assert client.get(f"/api/v1/org/units/{root}/history/").status_code == 404


def test_unit_head_sees_only_own_unit_and_breadcrumb(org, make_user, grant, client_for):
    head = make_user("head")
    grant(head, Role.UNIT_HEAD, org["dept-1"])
    assert visible_codes(client_for(head)) == {"root", "faculty-a", "dept-1"}


def test_publisher_has_no_organization_scope_in_phase_2(org, make_user, grant, client_for):
    publisher = make_user()
    grant(publisher, Role.PUBLISHER)
    assert visible_codes(client_for(publisher)) == set()


def test_roles_combine(org, make_user, grant, client_for):
    user = make_user()
    grant(user, Role.UNIT_HEAD, org["dept-1"])
    grant(user, Role.UNIT_HEAD, org["center"])
    assert visible_codes(client_for(user)) == {"root", "faculty-a", "dept-1", "center"}


# --- time-bounded roles (negative test #2) -----------------------------------------------------


def test_expired_role_grants_nothing(org, make_user, grant, client_for):
    today = timezone.localdate()
    user = make_user()
    grant(user, Role.RECTOR, valid_from=today - timedelta(days=30), valid_to=today)
    assert visible_codes(client_for(user)) == set()  # valid_to is exclusive


def test_role_that_has_not_started_grants_nothing(org, make_user, grant, client_for):
    today = timezone.localdate()
    user = make_user()
    grant(user, Role.RECTOR, valid_from=today + timedelta(days=1))
    assert visible_codes(client_for(user)) == set()


def test_role_ending_tomorrow_is_still_active_today(org, make_user, grant, client_for):
    today = timezone.localdate()
    user = make_user()
    grant(user, Role.RECTOR, valid_from=today, valid_to=today + timedelta(days=1))
    assert visible_codes(client_for(user)) == ALL_UNITS


# --- vice-rector supervision (negative test #5) ------------------------------------------------


def test_vice_rector_sees_only_assigned_units(org, make_user, grant, supervise, client_for):
    vr = make_user("vr")
    grant(vr, Role.VICE_RECTOR)
    supervise(vr, org["center"])
    client = client_for(vr)
    assert visible_codes(client) == {"root", "center"}
    for code in ("faculty-a", "faculty-b", "dept-1", "dept-2"):
        pk = org[code].pk
        assert client.get(f"/api/v1/org/units/{pk}/").status_code == 404
        assert client.get(f"/api/v1/org/units/{pk}/history/").status_code == 404
    assert client.get(f"/api/v1/org/units/{org['center'].pk}/history/").status_code == 200


def test_vice_rector_assigned_faculty_does_not_include_children(
    org, make_user, grant, supervise, client_for
):
    """Proposed: exactly the assigned units (least privilege); children need explicit scope."""
    vr = make_user("vr")
    grant(vr, Role.VICE_RECTOR)
    supervise(vr, org["faculty-a"])
    assert visible_codes(client_for(vr)) == {"root", "faculty-a"}


def test_supervision_without_vice_rector_role_grants_nothing(org, make_user, supervise, client_for):
    user = make_user()
    supervise(user, org["center"])
    assert visible_codes(client_for(user)) == set()


def test_vice_rector_without_scope_sees_nothing(org, make_user, grant, client_for):
    vr = make_user("vr")
    grant(vr, Role.VICE_RECTOR)
    assert visible_codes(client_for(vr)) == set()


def test_expired_supervision_scope_grants_nothing(org, make_user, grant, supervise, client_for):
    today = timezone.localdate()
    vr = make_user("vr")
    grant(vr, Role.VICE_RECTOR)
    supervise(vr, org["center"], valid_from=today - timedelta(days=10), valid_to=today)
    assert visible_codes(client_for(vr)) == set()


# --- deactivated users (negative test #6) ------------------------------------------------------


def test_deactivated_user_with_live_session_is_rejected(org, make_user, grant):
    user = make_user()
    grant(user, Role.RECTOR)
    client = APIClient()
    client.force_login(user)  # a real session cookie
    session = client.session
    session[SESSION_STARTED_KEY] = time.time()  # as LoginView does
    session.save()
    assert client.get("/api/v1/org/units/").status_code == 200
    user.is_active = False
    user.save(update_fields=["is_active"])
    assert client.get("/api/v1/org/units/").status_code in (401, 403)


def test_policy_denies_inactive_user_even_with_roles(org, make_user, grant):
    user = make_user()
    grant(user, Role.TECH_ADMIN)
    user.is_active = False
    assert policy.can(user, "access.manage") is False
    assert policy.active_roles(user) == set()


def test_unknown_action_is_denied_even_for_tech_admin(org, make_user, grant):
    user = make_user()
    grant(user, Role.TECH_ADMIN)
    assert policy.can(user, "results.read", obj=org["root"]) is False


def test_scope_queryset_denies_unknown_models(org, make_user, grant):
    from apps.accounts.models import User

    user = make_user()
    grant(user, Role.RECTOR)
    assert not policy.scope_queryset(user, User.objects.all()).exists()
