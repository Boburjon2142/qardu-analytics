"""Create the DatabaseCache table (settings.CACHES) so `migrate` in deploy.sh provisions it.

`createcachetable` skips tables that already exist, so this is safe to run on any database.
"""

from django.conf import settings
from django.core.management import call_command
from django.db import migrations


def _db_cache_tables():
    return [
        cfg["LOCATION"]
        for cfg in settings.CACHES.values()
        if cfg["BACKEND"] == "django.core.cache.backends.db.DatabaseCache"
    ]


def create_cache_tables(apps, schema_editor):
    call_command("createcachetable", database=schema_editor.connection.alias, verbosity=0)


def drop_cache_tables(apps, schema_editor):
    quote = schema_editor.quote_name
    for table in _db_cache_tables():
        schema_editor.execute(f"DROP TABLE IF EXISTS {quote(table)}")


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [migrations.RunPython(create_cache_tables, drop_cache_tables)]
