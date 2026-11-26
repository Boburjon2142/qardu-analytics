"""Time-bounded role assignments and vice-rector supervision scopes (milestone 2.3).

Both tables are history: a grant is never edited or deleted. Revoking a grant only sets or
shortens `valid_to` (DB trigger, migration 0002), so "who could see what, when" stays auditable.
Validity is the half-open date range [valid_from, valid_to); an empty range means "cancelled
before it started".
"""

from django.conf import settings
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import DateRangeField, RangeOperators
from django.db import models
from django.db.models import F, Func, Q, Value
from django.db.models.functions import Coalesce


class Role(models.TextChoices):
    # TT v4.0 §4.2 roles + the synthetic org_structure_approver (P2-8). Names are Proposed.
    TECH_ADMIN = "tech_admin", "tech_admin"
    RECTOR = "rector", "rector"
    VICE_RECTOR = "vice_rector", "vice_rector"
    DEAN = "dean", "dean"
    UNIT_HEAD = "unit_head", "unit_head"
    APPROVER = "approver", "approver"
    PUBLISHER = "publisher", "publisher"
    ORG_STRUCTURE_APPROVER = "org_structure_approver", "org_structure_approver"


# Roles bound to exactly one organization unit; every other role must have no unit.
UNIT_ROLES = frozenset({Role.DEAN, Role.UNIT_HEAD, Role.APPROVER})


def _validity_range():
    return Func(
        F("valid_from"),
        F("valid_to"),
        Value("[)"),
        function="daterange",
        output_field=DateRangeField(),
    )


class RoleAssignment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="role_assignments"
    )
    role = models.CharField(max_length=32, choices=Role.choices)
    unit = models.ForeignKey(
        "organization.OrganizationUnit",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="role_assignments",
    )
    valid_from = models.DateField()
    valid_to = models.DateField(null=True, blank=True)
    # NULL only for bootstrap grants made from the command line (no acting user).
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "valid_from"], name="access_role_user_idx")]
        constraints = [
            models.CheckConstraint(
                condition=Q(valid_to__isnull=True) | Q(valid_to__gte=F("valid_from")),
                name="access_role_valid_range",
            ),
            models.CheckConstraint(
                condition=(Q(role__in=sorted(UNIT_ROLES)) & Q(unit__isnull=False))
                | (~Q(role__in=sorted(UNIT_ROLES)) & Q(unit__isnull=True)),
                name="access_role_unit_matches_role",
            ),
            # P2-6: nobody grants a role to themselves.
            models.CheckConstraint(
                condition=Q(assigned_by__isnull=True) | ~Q(assigned_by=F("user")),
                name="access_role_not_self_assigned",
            ),
            # The same role on the same unit cannot be held twice at the same time.
            ExclusionConstraint(
                name="access_role_no_overlap",
                expressions=[
                    (F("user"), RangeOperators.EQUAL),
                    (F("role"), RangeOperators.EQUAL),
                    (Coalesce(F("unit"), Value(0)), RangeOperators.EQUAL),
                    (_validity_range(), RangeOperators.OVERLAPS),
                ],
            ),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.role}:{self.unit_id} [{self.valid_from}, {self.valid_to})"


class SupervisionScope(models.Model):
    """A unit a vice-rector supervises. Only the vice_rector role makes use of it."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="supervision_scopes"
    )
    unit = models.ForeignKey(
        "organization.OrganizationUnit", on_delete=models.PROTECT, related_name="supervisors"
    )
    valid_from = models.DateField()
    valid_to = models.DateField(null=True, blank=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "valid_from"], name="access_scope_user_idx")]
        constraints = [
            models.CheckConstraint(
                condition=Q(valid_to__isnull=True) | Q(valid_to__gte=F("valid_from")),
                name="access_scope_valid_range",
            ),
            models.CheckConstraint(
                condition=Q(assigned_by__isnull=True) | ~Q(assigned_by=F("user")),
                name="access_scope_not_self_assigned",
            ),
            ExclusionConstraint(
                name="access_scope_no_overlap",
                expressions=[
                    (F("user"), RangeOperators.EQUAL),
                    (F("unit"), RangeOperators.EQUAL),
                    (_validity_range(), RangeOperators.OVERLAPS),
                ],
            ),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.unit_id} [{self.valid_from}, {self.valid_to})"
