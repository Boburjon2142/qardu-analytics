"""Database-level guarantees for grants (they must hold even if application code is bypassed)."""

from datetime import date
from io import StringIO

import pytest
from django.core.management import CommandError, call_command
from django.db import DatabaseError, IntegrityError, connection, transaction

from apps.access.models import Role, RoleAssignment, SupervisionScope
from apps.audit.models import AuditEvent

pytestmark = pytest.mark.django_db
D = date
START = D(2025, 1, 1)


def raw_role(user, role=Role.RECTOR, unit=None, valid_from=START, valid_to=None, by=None):
    return RoleAssignment.objects.create(
        user=user, role=role, unit=unit, valid_from=valid_from, valid_to=valid_to, assigned_by=by
    )


def test_unit_roles_require_a_unit_and_others_forbid_one(org, make_user):
    user = make_user()
    with pytest.raises(IntegrityError), transaction.atomic():
        raw_role(user, role=Role.DEAN)
    with pytest.raises(IntegrityError), transaction.atomic():
        raw_role(user, role=Role.RECTOR, unit=org["faculty-a"])


def test_self_assignment_is_rejected_by_the_database(org, make_user):
    """Negative test #4 at DB level (P2-6)."""
    user = make_user()
    with pytest.raises(IntegrityError), transaction.atomic():
        raw_role(user, by=user)
    with pytest.raises(IntegrityError), transaction.atomic():
        SupervisionScope.objects.create(
            user=user, unit=org["center"], valid_from=D(2025, 1, 1), assigned_by=user
        )


def test_overlapping_identical_grants_are_rejected(org, make_user):
    user = make_user()
    raw_role(user, valid_from=D(2025, 1, 1), valid_to=D(2026, 1, 1))
    with pytest.raises(IntegrityError), transaction.atomic():
        raw_role(user, valid_from=D(2025, 6, 1))
    raw_role(user, valid_from=D(2026, 1, 1))  # adjacent (half-open) is fine


def test_same_role_on_different_units_may_overlap(org, make_user):
    user = make_user()
    raw_role(user, role=Role.UNIT_HEAD, unit=org["dept-1"])
    raw_role(user, role=Role.UNIT_HEAD, unit=org["center"])


def test_negative_range_is_rejected_but_empty_range_is_allowed(org, make_user):
    user = make_user()
    with pytest.raises(IntegrityError), transaction.atomic():
        raw_role(user, valid_from=D(2025, 1, 2), valid_to=D(2025, 1, 1))
    raw_role(user, valid_from=D(2025, 1, 1), valid_to=D(2025, 1, 1))  # cancelled grant


def _blocked(sql, params=None):
    with (
        pytest.raises(DatabaseError, match="append-only"),
        transaction.atomic(),
        connection.cursor() as cursor,
    ):
        # Flush deferred FK checks so TRUNCATE reaches our trigger instead of failing earlier.
        cursor.execute("SET CONSTRAINTS ALL IMMEDIATE")
        cursor.execute(sql, params or [])


@pytest.mark.parametrize(
    ("column", "value"),
    [("role", "'publisher'"), ("valid_from", "'2020-01-01'"), ("user_id", "user_id + 1")],
)
def test_grant_columns_cannot_be_changed(org, make_user, column, value):
    assignment = raw_role(make_user())
    make_user()
    _blocked(
        f"UPDATE access_roleassignment SET {column} = {value} WHERE id = %s",  # noqa: S608
        [assignment.pk],
    )


def test_valid_to_can_be_set_and_shortened_but_never_extended_or_cleared(org, make_user):
    assignment = raw_role(make_user())
    qs = RoleAssignment.objects.filter(pk=assignment.pk)
    qs.update(valid_to=D(2027, 1, 1))  # set
    qs.update(valid_to=D(2026, 6, 1))  # shorten
    _blocked(
        "UPDATE access_roleassignment SET valid_to = %s WHERE id = %s",
        [D(2028, 1, 1), assignment.pk],
    )
    _blocked("UPDATE access_roleassignment SET valid_to = NULL WHERE id = %s", [assignment.pk])
    assignment.refresh_from_db()
    assert assignment.valid_to == D(2026, 6, 1)


@pytest.mark.parametrize(
    "sql",
    [
        "DELETE FROM access_roleassignment",
        "TRUNCATE access_roleassignment",
        "DELETE FROM access_supervisionscope",
        "TRUNCATE access_supervisionscope",
    ],
)
def test_grants_cannot_be_deleted(org, make_user, sql):
    user = make_user()
    raw_role(user)
    SupervisionScope.objects.create(user=user, unit=org["center"], valid_from=D(2025, 1, 1))
    _blocked(sql)


def test_supervision_scope_cannot_be_moved_to_another_unit(org, make_user):
    scope = SupervisionScope.objects.create(
        user=make_user(), unit=org["center"], valid_from=D(2025, 1, 1)
    )
    _blocked(
        "UPDATE access_supervisionscope SET unit_id = %s WHERE id = %s",
        [org["dept-1"].pk, scope.pk],
    )


def test_assignrole_bootstraps_the_first_admin_and_audits(org, make_user):
    user = make_user("first-admin")
    out = StringIO()
    call_command("assignrole", email=user.email, role="tech_admin", stdout=out)
    assert "Created role assignment" in out.getvalue()
    assignment = RoleAssignment.objects.get(user=user)
    assert assignment.role == "tech_admin" and assignment.assigned_by is None
    assert AuditEvent.objects.filter(
        action="access.role.assign", actor=None, object_id=str(assignment.pk)
    ).exists()


def test_assignrole_rejects_unknown_user_unit_and_invalid_combination(org, make_user):
    user = make_user()
    with pytest.raises(CommandError, match="No user"):
        call_command("assignrole", email="nobody@example.org", role="rector")
    with pytest.raises(CommandError, match="No organization unit"):
        call_command("assignrole", email=user.email, role="dean", unit="missing")
    with pytest.raises(CommandError, match="requires a unit"):
        call_command("assignrole", email=user.email, role="dean")
