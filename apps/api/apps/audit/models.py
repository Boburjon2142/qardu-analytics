from django.conf import settings
from django.db import models


class AuditImmutableError(Exception):
    pass


class AuditQuerySet(models.QuerySet):
    def update(self, **kwargs):
        raise AuditImmutableError("AuditEvent is append-only")

    def delete(self):
        raise AuditImmutableError("AuditEvent is append-only")


class AuditEvent(models.Model):
    """Append-only audit trail. Never store passwords, tokens or confidential text here.

    Immutability is enforced at three levels: this model, the queryset, and PostgreSQL
    triggers (migration 0002). Actors are PROTECTed: users are deactivated, not deleted.
    """

    OUTCOMES = [("success", "success"), ("failure", "failure"), ("denied", "denied")]

    at = models.DateTimeField(auto_now_add=True, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="+",
    )
    action = models.CharField(max_length=64)
    object_type = models.CharField(max_length=64, blank=True)
    object_id = models.CharField(max_length=128, blank=True)
    outcome = models.CharField(max_length=16, choices=OUTCOMES)
    request_id = models.CharField(max_length=64, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)

    objects = AuditQuerySet.as_manager()

    class Meta:
        indexes = [models.Index(fields=["action", "at"], name="audit_action_at_idx")]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise AuditImmutableError("AuditEvent is append-only")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise AuditImmutableError("AuditEvent is append-only")
