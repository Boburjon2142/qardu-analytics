from django.db import migrations

FORWARD = """
-- Versions: only valid_to may change, and only once (NULL -> date). No deletes.
CREATE FUNCTION organization_version_guard() RETURNS trigger AS $$
BEGIN
    IF TG_OP IN ('DELETE', 'TRUNCATE') THEN
        RAISE EXCEPTION 'organization history is append-only (% blocked)', TG_OP
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    IF (NEW.id, NEW.unit_id, NEW.name, NEW.unit_type, NEW.parent_unit_id,
        NEW.valid_from, NEW.created_at)
       IS DISTINCT FROM
       (OLD.id, OLD.unit_id, OLD.name, OLD.unit_type, OLD.parent_unit_id,
        OLD.valid_from, OLD.created_at) THEN
        RAISE EXCEPTION 'organization history is append-only (only valid_to may be set)'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    IF OLD.valid_to IS NOT NULL AND NEW.valid_to IS DISTINCT FROM OLD.valid_to THEN
        RAISE EXCEPTION 'organization history is append-only (valid_to is already set)'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organization_version_guard_row
    BEFORE UPDATE OR DELETE ON organization_organizationunitversion
    FOR EACH ROW EXECUTE FUNCTION organization_version_guard();
CREATE TRIGGER organization_version_guard_truncate
    BEFORE TRUNCATE ON organization_organizationunitversion
    FOR EACH STATEMENT EXECUTE FUNCTION organization_version_guard();

-- Units: the permanent identity (code) never changes; units are never deleted.
CREATE FUNCTION organization_unit_guard() RETURNS trigger AS $$
BEGIN
    IF TG_OP IN ('DELETE', 'TRUNCATE') THEN
        RAISE EXCEPTION 'organization units cannot be deleted (% blocked)', TG_OP
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    IF (NEW.id, NEW.code, NEW.created_at) IS DISTINCT FROM (OLD.id, OLD.code, OLD.created_at) THEN
        RAISE EXCEPTION 'organization unit identity is immutable'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organization_unit_guard_row
    BEFORE UPDATE OR DELETE ON organization_organizationunit
    FOR EACH ROW EXECUTE FUNCTION organization_unit_guard();
CREATE TRIGGER organization_unit_guard_truncate
    BEFORE TRUNCATE ON organization_organizationunit
    FOR EACH STATEMENT EXECUTE FUNCTION organization_unit_guard();
"""

REVERSE = """
DROP TRIGGER IF EXISTS organization_unit_guard_truncate ON organization_organizationunit;
DROP TRIGGER IF EXISTS organization_unit_guard_row ON organization_organizationunit;
DROP FUNCTION IF EXISTS organization_unit_guard();
DROP TRIGGER IF EXISTS organization_version_guard_truncate
    ON organization_organizationunitversion;
DROP TRIGGER IF EXISTS organization_version_guard_row ON organization_organizationunitversion;
DROP FUNCTION IF EXISTS organization_version_guard();
"""


class Migration(migrations.Migration):
    dependencies = [("organization", "0001_initial")]
    operations = [migrations.RunSQL(FORWARD, REVERSE)]
