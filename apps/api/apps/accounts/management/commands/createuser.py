from getpass import getpass

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create a user. The password is read from an interactive prompt (never an argument)."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--full-name", required=True)

    def handle(self, *args, **options):
        User = get_user_model()
        email = options["email"].strip().lower()
        if User.objects.filter(email=email).exists():
            raise CommandError("A user with this email already exists.")
        password = getpass("Password: ")
        if password != getpass("Password (again): "):
            raise CommandError("Passwords do not match.")
        candidate = User(email=email, full_name=options["full_name"])
        try:
            validate_password(password, user=candidate)
        except ValidationError as exc:
            raise CommandError("; ".join(exc.messages)) from exc
        user = User.objects.create_user(
            email=email, password=password, full_name=options["full_name"]
        )
        self.stdout.write(f"Created user id={user.pk}")
