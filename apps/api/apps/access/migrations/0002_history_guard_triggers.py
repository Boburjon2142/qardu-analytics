from django.db import migrations

# Grants are history. The only permitted UPDATE is ending a grant: setting valid_to on an
# open-ended row, or moving an existing valid_to earlier (never later, never back to NULL).
# The range CHECK (valid_to >= valid_from) still applies. Deletes are blocked.
GUARD = """
CREATE FUNCTION {name}() RETURNS trigger AS $$
BEGIN
    IF TG_OP IN ('DELETE', 'TRUNCATE') THEN
        RAISE EXCEPTION '{table} is append-only (% blocked)', TG_OP
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    IF ({cols_new}) IS DISTINCT FROM ({cols_old}) THEN
        RAISE EXCEPTION '{table} is append-only (only valid_to may be set)'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    IF NEW.valid_to IS DISTINCT FROM OLD.valid_to AND (
        NEW.valid_to IS NULL OR (OLD.valid_to IS NOT NULL AND NEW.valid_to > OLD.valid_to)
    ) THEN
        RAISE EXCEPTION '{table} is append-only (valid_to may only be set or shortened)'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER {name}_row
    BEFORE UPDATE OR DELETE ON {table}
    FOR EACH ROW EXECUTE FUNCTION {name}();
CREATE TRIGGER {name}_truncate
    BEFORE TRUNCATE ON {table}
    FOR EACH STATEMENT EXECUTE FUNCTION {name}();
"""

DROP = """
DROP TRIGGER IF EXISTS {name}_truncate ON {table};
DROP TRIGGER IF EXISTS {name}_row ON {table};
DROP FUNCTION IF EXISTS {name}();
"""


def _cols(prefix, cols):
    return ", ".join(f"{prefix}.{c}" for c in cols)


TABLES = {
    "access_roleassignment": (
        "access_role_guard",
        ["id", "user_id", "role", "unit_id", "valid_from", "assigned_by_id", "created_at"],
    ),
    "access_supervisionscope": (
        "access_scope_guard",
        ["id", "user_id", "unit_id", "valid_from", "assigned_by_id", "created_at"],
    ),
}

FORWARD = "".join(
    GUARD.format(name=name, table=table, cols_new=_cols("NEW", cols), cols_old=_cols("OLD", cols))
    for table, (name, cols) in TABLES.items()
)
REVERSE = "".join(DROP.format(name=name, table=table) for table, (name, _) in TABLES.items())


class Migration(migrations.Migration):
    dependencies = [("access", "0001_initial")]
    operations = [migrations.RunSQL(FORWARD, REVERSE)]
