from datetime import date

import pytest

from apps.organization.models import OrganizationUnit, OrganizationUnitVersion, UnitType

D = date


@pytest.fixture
def make_unit(db):
    def _make(code):
        return OrganizationUnit.objects.create(code=code)

    return _make


@pytest.fixture
def make_version(db):
    """Raw ORM insert (bypasses services) so DB constraints can be tested directly."""

    def _make(unit, name="N", valid_from=None, valid_to=None, parent=None, kind=None):
        return OrganizationUnitVersion.objects.create(
            unit=unit,
            name=name,
            unit_type=kind or UnitType.DEPARTMENT,
            parent_unit=parent,
            valid_from=valid_from or D(2024, 1, 1),
            valid_to=valid_to,
        )

    return _make
