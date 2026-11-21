import pytest
from django.db import DatabaseError, connection, transaction

from apps.audit.models import AuditEvent, AuditImmutableError
from apps.audit.services import record

pytestmark = pytest.mark.django_db


@pytest.fixture
def event():
    return record(action="test.action", outcome="success", object_type="t", object_id="1")


def test_model_level_update_and_delete_are_refused(event):
    event.action = "changed"
    with pytest.raises(AuditImmutableError):
        event.save()
    with pytest.raises(AuditImmutableError):
        event.delete()
    with pytest.raises(AuditImmutableError):
        AuditEvent.objects.all().update(action="x")
    with pytest.raises(AuditImmutableError):
        AuditEvent.objects.all().delete()


@pytest.mark.parametrize(
    "sql",
    [
        "UPDATE audit_auditevent SET action = 'tampered'",
        "DELETE FROM audit_auditevent",
        "TRUNCATE audit_auditevent",
    ],
)
def test_database_triggers_refuse_raw_sql(event, sql):
    """Bypassing the ORM must still fail (defence in depth)."""
    with (
        pytest.raises(DatabaseError, match="append-only"),
        transaction.atomic(),
        connection.cursor() as cursor,
    ):
        # Flush deferred FK checks so TRUNCATE cannot fail for an unrelated reason.
        cursor.execute("SET CONSTRAINTS ALL IMMEDIATE")
        cursor.execute(sql)
    assert AuditEvent.objects.get(pk=event.pk).action == "test.action"
