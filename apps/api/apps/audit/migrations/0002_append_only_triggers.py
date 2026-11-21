from django.db import migrations

FORWARD = """
CREATE FUNCTION audit_auditevent_append_only() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'audit_auditevent is append-only (% blocked)', TG_OP
        USING ERRCODE = 'integrity_constraint_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_auditevent_no_update_delete
    BEFORE UPDATE OR DELETE ON audit_auditevent
    FOR EACH ROW EXECUTE FUNCTION audit_auditevent_append_only();

CREATE TRIGGER audit_auditevent_no_truncate
    BEFORE TRUNCATE ON audit_auditevent
    FOR EACH STATEMENT EXECUTE FUNCTION audit_auditevent_append_only();
"""

REVERSE = """
DROP TRIGGER IF EXISTS audit_auditevent_no_truncate ON audit_auditevent;
DROP TRIGGER IF EXISTS audit_auditevent_no_update_delete ON audit_auditevent;
DROP FUNCTION IF EXISTS audit_auditevent_append_only();
"""


class Migration(migrations.Migration):
    dependencies = [("audit", "0001_initial")]
    operations = [migrations.RunSQL(FORWARD, REVERSE)]
