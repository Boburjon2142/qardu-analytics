from datetime import date

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError

from apps.access.models import Role
from apps.access.services import assign_role
from apps.organization.models import OrganizationUnit


class Command(BaseCommand):
    help = (
        "Bootstrap a role grant from the command line (e.g. the first tech_admin). The grant is "
        "audited with no acting user. Day-to-day grants go through the ADMIN API instead."
    )

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--role", required=True, choices=Role.values)
        parser.add_argument("--unit", help="Organization unit code (dean/unit_head/approver)")
        parser.add_argument(
            "--valid-from", type=date.fromisoformat, help="YYYY-MM-DD; default today"
        )
        parser.add_argument("--valid-to", type=date.fromisoformat, help="YYYY-MM-DD; default open")

    def handle(self, *args, **options):
        User = get_user_model()
        try:
            user = User.objects.get(email=options["email"].strip().lower())
        except User.DoesNotExist as exc:
            raise CommandError("No user with this email.") from exc
        unit = None
        if options["unit"]:
            try:
                unit = OrganizationUnit.objects.get(code=options["unit"])
            except OrganizationUnit.DoesNotExist as exc:
                raise CommandError("No organization unit with this code.") from exc
        try:
            assignment = assign_role(
                user=user,
                role=options["role"],
                unit=unit,
                valid_from=options["valid_from"],
                valid_to=options["valid_to"],
                backdate_allowed=True,
            )
        except ValidationError as exc:
            raise CommandError("; ".join(exc.messages)) from exc
        self.stdout.write(f"Created role assignment id={assignment.pk}")
