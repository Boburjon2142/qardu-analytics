from datetime import date

from django.core.management.base import BaseCommand

from apps.organization.models import UnitType
from apps.organization.services import close_version, create_version, get_or_create_unit


class Command(BaseCommand):
    help = (
        "Create a SYNTHETIC demo hierarchy (not real university data). Idempotent: does nothing "
        "if the root unit already exists."
    )

    def handle(self, *args, **options):
        if get_or_create_unit("demo-root").versions.exists():
            self.stdout.write("Demo hierarchy already present; nothing to do.")
            return
        start = date(2024, 9, 1)
        root = get_or_create_unit("demo-root")
        fac_a = get_or_create_unit("demo-faculty-a")
        fac_b = get_or_create_unit("demo-faculty-b")
        dep_1 = get_or_create_unit("demo-dept-1")
        dep_2 = get_or_create_unit("demo-dept-2")
        center = get_or_create_unit("demo-center")

        create_version(
            unit=root, name="Sinov universiteti", unit_type=UnitType.UNIVERSITY, valid_from=start
        )
        old_fac_a = create_version(
            unit=fac_a,
            name="Sinov fakulteti A",
            parent_unit=root,
            unit_type=UnitType.FACULTY,
            valid_from=start,
        )
        create_version(
            unit=fac_b,
            name="Sinov fakulteti B",
            parent_unit=root,
            unit_type=UnitType.FACULTY,
            valid_from=start,
        )
        create_version(
            unit=dep_1,
            name="Sinov kafedrasi 1",
            parent_unit=fac_a,
            unit_type=UnitType.DEPARTMENT,
            valid_from=start,
        )
        # dep_2 moves from faculty A to faculty B: demonstrates effective-dated history.
        old_dep_2 = create_version(
            unit=dep_2,
            name="Sinov kafedrasi 2",
            parent_unit=fac_a,
            unit_type=UnitType.DEPARTMENT,
            valid_from=start,
        )
        create_version(
            unit=center,
            name="Sinov markazi",
            parent_unit=root,
            unit_type=UnitType.CENTER,
            valid_from=start,
        )

        change = date(2025, 9, 1)
        close_version(old_dep_2, change)
        create_version(
            unit=dep_2,
            name="Sinov kafedrasi 2",
            parent_unit=fac_b,
            unit_type=UnitType.DEPARTMENT,
            valid_from=change,
        )
        # Faculty A is renamed.
        close_version(old_fac_a, change)
        create_version(
            unit=fac_a,
            name="Sinov fakulteti A (yangi nom)",
            parent_unit=root,
            unit_type=UnitType.FACULTY,
            valid_from=change,
        )
        self.stdout.write("Created synthetic demo hierarchy (6 units, 2 structural changes).")
