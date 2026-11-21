from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models
from django.db.models.functions import Lower


class UserManager(BaseUserManager):
    use_in_migrations = True

    def get_by_natural_key(self, email):
        return self.get(email=email.strip().lower())

    def create_user(self, email, password=None, **extra):
        email = (email or "").strip().lower()
        if not email:
            raise ValueError("email is required")
        user = self.model(email=email, **extra)
        user.set_password(password)  # None -> unusable password
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    """Institutional user. Created by administrators only; no self-registration.

    Deliberately has no is_staff/is_superuser: Django admin is not enabled and technical
    administrators receive no blanket access (roles/scopes arrive in milestone 2.3).
    """

    email = models.EmailField(max_length=254, unique=True)
    full_name = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(email=Lower("email")), name="accounts_user_email_lowercase"
            ),
        ]

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
