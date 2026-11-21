from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import DateRangeField, RangeOperators
from django.db import models
from django.db.models import F, Func, Q, Value


class UnitType(models.TextChoices):
    # Proposed list; the real registry (B1) is Unresolved and may add/rename types.
    UNIVERSITY = "university", "university"
    FACULTY = "faculty", "faculty"
    DEPARTMENT = "department", "department"
    OFFICE = "office", "office"
    CENTER = "center", "center"


class OrganizationUnit(models.Model):
    """Permanent identity of a unit. Name, type and parent live in versions (effective-dated)."""

    code = models.SlugField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code


class OrganizationUnitVersion(models.Model):
    """One effective-dated state of a unit: valid for [valid_from, valid_to).

    `valid_to` NULL means open-ended. A structural change adds a new version and closes the
    previous one; no other column of an existing version may change (DB trigger, migration 0002),
    so results keep their historical affiliation.
    """

    unit = models.ForeignKey(OrganizationUnit, on_delete=models.PROTECT, related_name="versions")
    name = models.CharField(max_length=200)
    unit_type = models.CharField(max_length=20, choices=UnitType.choices)
    parent_unit = models.ForeignKey(
        OrganizationUnit,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="child_versions",
    )
    valid_from = models.DateField()
    valid_to = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["unit", "valid_from"], name="org_version_unit_from_idx"),
            models.Index(fields=["parent_unit", "valid_from"], name="org_version_parent_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(valid_to__isnull=True) | Q(valid_to__gt=F("valid_from")),
                name="org_version_valid_range",
            ),
            models.CheckConstraint(
                condition=Q(parent_unit__isnull=True) | ~Q(parent_unit=F("unit")),
                name="org_version_not_own_parent",
            ),
            # A unit cannot have two versions valid at the same time (half-open daterange).
            ExclusionConstraint(
                name="org_version_no_overlap",
                expressions=[
                    (F("unit"), RangeOperators.EQUAL),
                    (
                        Func(
                            F("valid_from"),
                            F("valid_to"),
                            Value("[)"),
                            function="daterange",
                            output_field=DateRangeField(),
                        ),
                        RangeOperators.OVERLAPS,
                    ),
                ],
            ),
        ]

    def __str__(self):
        return f"{self.unit_id}:{self.name} [{self.valid_from}, {self.valid_to})"
