from datetime import date

import pytest
from django.core.exceptions import ValidationError

from apps.audit.models import AuditEvent
from apps.organization import services
from apps.organization.models import UnitType

pytestmark = pytest.mark.django_db
D = date


@pytest.fixture
def tree(make_unit):
    """root -> fac_a -> dept ; dept moves under fac_b on 2025-09-01."""
    u = {k: make_unit(k) for k in ("root", "fac_a", "fac_b", "dept")}
    s = D(2024, 9, 1)
    services.create_version(
        unit=u["root"], name="Root", unit_type=UnitType.UNIVERSITY, valid_from=s
    )
    for key in ("fac_a", "fac_b"):
        services.create_version(
            unit=u[key], name=key, unit_type=UnitType.FACULTY, parent_unit=u["root"], valid_from=s
        )
    old = services.create_version(
        unit=u["dept"],
        name="Dept",
        unit_type=UnitType.DEPARTMENT,
        parent_unit=u["fac_a"],
        valid_from=s,
    )
    move = D(2025, 9, 1)
    services.close_version(old, move)
    services.create_version(
        unit=u["dept"],
        name="Dept",
        unit_type=UnitType.DEPARTMENT,
        parent_unit=u["fac_b"],
        valid_from=move,
    )
    return u


def ids(*units):
    return {x.pk for x in units}


def test_descendants_follow_history(tree):
    before, after = D(2025, 1, 1), D(2026, 1, 1)
    assert services.descendant_ids(tree["fac_a"].pk, before) == ids(tree["fac_a"], tree["dept"])
    assert services.descendant_ids(tree["fac_a"].pk, after) == ids(tree["fac_a"])
    assert services.descendant_ids(tree["fac_b"].pk, after) == ids(tree["fac_b"], tree["dept"])
    assert services.descendant_ids(tree["root"].pk, after) == ids(*tree.values())


def test_boundary_day_uses_the_new_version(tree):
    on_move_day = D(2025, 9, 1)
    assert tree["dept"].pk in services.descendant_ids(tree["fac_b"].pk, on_move_day)
    assert tree["dept"].pk not in services.descendant_ids(tree["fac_a"].pk, on_move_day)
    last_old_day = D(2025, 8, 31)
    assert tree["dept"].pk in services.descendant_ids(tree["fac_a"].pk, last_old_day)


def test_unit_does_not_exist_before_its_first_version(tree):
    assert services.descendant_ids(tree["root"].pk, D(2020, 1, 1)) == set()
    assert services.versions_as_of(D(2020, 1, 1)).count() == 0


def test_ancestors(tree):
    assert services.ancestor_ids(tree["dept"].pk, D(2025, 1, 1)) == ids(
        tree["dept"], tree["fac_a"], tree["root"]
    )
    assert services.ancestor_ids(tree["dept"].pk, D(2026, 1, 1)) == ids(
        tree["dept"], tree["fac_b"], tree["root"]
    )


def test_future_version_is_invisible_until_its_date(tree, make_unit):
    new = make_unit("future")
    services.create_version(
        unit=new,
        name="Future",
        unit_type=UnitType.CENTER,
        parent_unit=tree["root"],
        valid_from=D(2030, 1, 1),
    )
    assert new.pk not in services.descendant_ids(tree["root"].pk, D(2029, 12, 31))
    assert new.pk in services.descendant_ids(tree["root"].pk, D(2030, 1, 1))


def test_cycle_is_rejected(tree):
    with pytest.raises(ValidationError, match="cycle"):
        services.create_version(
            unit=tree["root"],
            name="Root",
            unit_type=UnitType.FACULTY,
            parent_unit=tree["dept"],
            valid_from=D(2031, 1, 1),
        )


def test_self_parent_and_orphan_parent_are_rejected(tree, make_unit):
    with pytest.raises(ValidationError, match="own parent"):
        services.create_version(
            unit=tree["dept"],
            name="x",
            unit_type=UnitType.OFFICE,
            parent_unit=tree["dept"],
            valid_from=D(2032, 1, 1),
        )
    ghost = make_unit("ghost")  # no versions at all
    with pytest.raises(ValidationError, match="does not exist"):
        services.create_version(
            unit=make_unit("child"),
            name="c",
            unit_type=UnitType.OFFICE,
            parent_unit=ghost,
            valid_from=D(2024, 9, 1),
        )


def test_overlap_is_reported_as_validation_error(tree):
    with pytest.raises(ValidationError, match="overlaps"):
        services.create_version(
            unit=tree["fac_a"],
            name="dup",
            unit_type=UnitType.FACULTY,
            parent_unit=tree["root"],
            valid_from=D(2025, 1, 1),
        )


def test_close_version_rules(tree):
    version = tree["fac_b"].versions.get()
    with pytest.raises(ValidationError, match="after valid_from"):
        services.close_version(version, D(2024, 9, 1))
    services.close_version(version, D(2027, 1, 1))
    with pytest.raises(ValidationError, match="already closed"):
        services.close_version(version, D(2028, 1, 1))


def test_writes_are_audited(tree):
    assert AuditEvent.objects.filter(action="org.version.create").count() == 5
    assert AuditEvent.objects.filter(action="org.version.close").count() == 1
