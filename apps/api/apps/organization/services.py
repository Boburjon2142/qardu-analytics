"""As-of-date queries and validated writes for the organization registry.

All reads are "as of" a date, so structure that takes effect in the future needs no scheduler:
it simply becomes visible when the date arrives.
"""

from datetime import date

from django.core.exceptions import ValidationError
from django.db import IntegrityError, connection, transaction
from django.db.models import Q

from apps.audit.services import record

from .models import OrganizationUnit, OrganizationUnitVersion

_TABLE = OrganizationUnitVersion._meta.db_table


def as_of_q(on: date, prefix: str = "") -> Q:
    """Rows whose half-open validity range [valid_from, valid_to) contains `on`."""
    return Q(**{f"{prefix}valid_from__lte": on}) & (
        Q(**{f"{prefix}valid_to__isnull": True}) | Q(**{f"{prefix}valid_to__gt": on})
    )


def versions_as_of(on: date):
    return OrganizationUnitVersion.objects.filter(as_of_q(on)).select_related("unit")


def descendant_ids(unit_id: int, on: date) -> set[int]:
    """`unit_id` and every unit below it, using the parent links valid on `on`.

    UNION (not UNION ALL) de-duplicates, so even a corrupt cycle cannot loop forever.
    """
    sql = f"""
        WITH RECURSIVE tree(unit_id) AS (
            SELECT v.unit_id FROM {_TABLE} v
            WHERE v.unit_id = %s AND v.valid_from <= %s AND (v.valid_to IS NULL OR v.valid_to > %s)
            UNION
            SELECT c.unit_id FROM {_TABLE} c
            JOIN tree t ON c.parent_unit_id = t.unit_id
            WHERE c.valid_from <= %s AND (c.valid_to IS NULL OR c.valid_to > %s)
        )
        SELECT unit_id FROM tree
    """  # noqa: S608 - table name comes from model metadata, values are parameters
    with connection.cursor() as cursor:
        cursor.execute(sql, [unit_id, on, on, on, on])
        return {row[0] for row in cursor.fetchall()}


def ancestor_ids(unit_id: int, on: date) -> set[int]:
    """`unit_id` and every unit above it, using the parent links valid on `on`."""
    sql = f"""
        WITH RECURSIVE chain(unit_id, parent_id) AS (
            SELECT v.unit_id, v.parent_unit_id FROM {_TABLE} v
            WHERE v.unit_id = %s AND v.valid_from <= %s AND (v.valid_to IS NULL OR v.valid_to > %s)
            UNION
            SELECT p.unit_id, p.parent_unit_id FROM {_TABLE} p
            JOIN chain c ON p.unit_id = c.parent_id
            WHERE p.valid_from <= %s AND (p.valid_to IS NULL OR p.valid_to > %s)
        )
        SELECT unit_id FROM chain
    """  # noqa: S608
    with connection.cursor() as cursor:
        cursor.execute(sql, [unit_id, on, on, on, on])
        return {row[0] for row in cursor.fetchall()}


@transaction.atomic
def create_version(
    *, unit, name, unit_type, valid_from, parent_unit=None, valid_to=None, actor=None, request=None
):
    """Add a version, rejecting orphans and parent cycles. Overlaps are rejected by the database."""
    if valid_to is not None and valid_to <= valid_from:
        raise ValidationError("valid_to must be after valid_from.")
    if parent_unit is not None:
        if parent_unit.pk == unit.pk:
            raise ValidationError("A unit cannot be its own parent.")
        if parent_unit.pk not in {
            v.unit_id for v in versions_as_of(valid_from).filter(unit=parent_unit)
        }:
            raise ValidationError("The parent unit does not exist on the effective date.")
        if unit.pk in ancestor_ids(parent_unit.pk, valid_from):
            raise ValidationError("This parent would create a cycle in the hierarchy.")
    try:
        with transaction.atomic():
            version = OrganizationUnitVersion.objects.create(
                unit=unit,
                name=name,
                unit_type=unit_type,
                parent_unit=parent_unit,
                valid_from=valid_from,
                valid_to=valid_to,
            )
    except IntegrityError as exc:
        raise ValidationError("The version overlaps another version of this unit.") from exc
    record(
        request,
        action="org.version.create",
        outcome="success",
        actor=actor,
        object_type="organization_unit_version",
        object_id=str(version.pk),
    )
    return version


@transaction.atomic
def close_version(version, valid_to, *, actor=None, request=None):
    """Set `valid_to` once on an open-ended version (the only permitted UPDATE)."""
    version = OrganizationUnitVersion.objects.select_for_update().get(pk=version.pk)
    if version.valid_to is not None:
        raise ValidationError("This version is already closed.")
    if valid_to <= version.valid_from:
        raise ValidationError("valid_to must be after valid_from.")
    version.valid_to = valid_to
    version.save(update_fields=["valid_to"])
    record(
        request,
        action="org.version.close",
        outcome="success",
        actor=actor,
        object_type="organization_unit_version",
        object_id=str(version.pk),
    )
    return version


def get_or_create_unit(code: str) -> OrganizationUnit:
    return OrganizationUnit.objects.get_or_create(code=code)[0]
