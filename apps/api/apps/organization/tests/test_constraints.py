"""Database-level guarantees (they must hold even if application code is bypassed)."""

from datetime import date

import pytest
from django.db import DatabaseError, IntegrityError, connection, transaction

from apps.organization.models import OrganizationUnit, OrganizationUnitVersion

pytestmark = pytest.mark.django_db
D = date


def test_overlapping_versions_of_one_unit_are_rejected(make_unit, make_version):
    unit = make_unit("u")
    make_version(unit, valid_from=D(2024, 1, 1), valid_to=D(2025, 1, 1))
    with pytest.raises(IntegrityError), transaction.atomic():
        make_version(unit, valid_from=D(2024, 6, 1), valid_to=D(2026, 1, 1))


def test_open_ended_version_blocks_any_later_overlap(make_unit, make_version):
    unit = make_unit("u")
    make_version(unit, valid_from=D(2024, 1, 1))  # open-ended
    with pytest.raises(IntegrityError), transaction.atomic():
        make_version(unit, valid_from=D(2030, 1, 1), valid_to=D(2031, 1, 1))


def test_adjacent_versions_are_allowed_half_open(make_unit, make_version):
    unit = make_unit("u")
    make_version(unit, valid_from=D(2024, 1, 1), valid_to=D(2025, 1, 1))
    make_version(unit, valid_from=D(2025, 1, 1))  # starts the day the previous ends
    assert unit.versions.count() == 2


def test_different_units_may_have_the_same_dates(make_unit, make_version):
    make_version(make_unit("a"), valid_from=D(2024, 1, 1))
    make_version(make_unit("b"), valid_from=D(2024, 1, 1))


def test_valid_range_must_be_positive(make_unit, make_version):
    with pytest.raises(IntegrityError), transaction.atomic():
        make_version(make_unit("u"), valid_from=D(2024, 1, 1), valid_to=D(2024, 1, 1))


def test_unit_cannot_be_its_own_parent(make_unit, make_version):
    unit = make_unit("u")
    with pytest.raises(IntegrityError), transaction.atomic():
        make_version(unit, parent=unit)


def test_unit_code_is_unique(make_unit):
    make_unit("dup")
    with pytest.raises(IntegrityError), transaction.atomic():
        OrganizationUnit.objects.create(code="dup")


def _blocked(sql, params=None):
    with (
        pytest.raises(DatabaseError, match="append-only|immutable|cannot be deleted"),
        transaction.atomic(),
        connection.cursor() as cursor,
    ):
        cursor.execute("SET CONSTRAINTS ALL IMMEDIATE")
        cursor.execute(sql, params or [])


@pytest.mark.parametrize("column", ["name", "unit_type", "valid_from"])
def test_history_columns_cannot_be_changed(make_unit, make_version, column):
    version = make_version(make_unit("u"))
    value = {"name": "'renamed'", "unit_type": "'office'", "valid_from": "'2023-01-01'"}[column]
    _blocked(
        f"UPDATE organization_organizationunitversion SET {column} = {value} WHERE id = %s",  # noqa: S608
        [version.pk],
    )
    version.refresh_from_db()
    assert version.name == "N"


def test_parent_cannot_be_changed_in_place(make_unit, make_version):
    parent, other = make_unit("p"), make_unit("q")
    version = make_version(make_unit("u"), parent=parent)
    _blocked(
        "UPDATE organization_organizationunitversion SET parent_unit_id = %s WHERE id = %s",
        [other.pk, version.pk],
    )


def test_valid_to_can_be_set_once_only(make_unit, make_version):
    version = make_version(make_unit("u"))
    OrganizationUnitVersion.objects.filter(pk=version.pk).update(valid_to=D(2025, 1, 1))
    _blocked(
        "UPDATE organization_organizationunitversion SET valid_to = %s WHERE id = %s",
        [D(2026, 1, 1), version.pk],
    )
    version.refresh_from_db()
    assert version.valid_to == D(2025, 1, 1)


@pytest.mark.parametrize(
    "sql",
    [
        "DELETE FROM organization_organizationunitversion",
        "TRUNCATE organization_organizationunitversion",
        "DELETE FROM organization_organizationunit",
        "TRUNCATE organization_organizationunit CASCADE",
    ],
)
def test_history_and_units_cannot_be_deleted(make_unit, make_version, sql):
    make_version(make_unit("u"))
    _blocked(sql)


def test_unit_code_is_immutable(make_unit):
    unit = make_unit("u")
    _blocked("UPDATE organization_organizationunit SET code = 'x' WHERE id = %s", [unit.pk])
