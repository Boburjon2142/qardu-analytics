"""Grant validity follows the university's calendar day (Asia/Tashkent, UTC+5), not UTC."""

from datetime import UTC, date, datetime
from unittest.mock import patch

import pytest
from django.utils import timezone

from apps import policy
from apps.access.models import Role

pytestmark = pytest.mark.django_db

# 2026-11-26 20:30 UTC is already 2026-11-27 01:30 in Tashkent.
AFTER_LOCAL_MIDNIGHT = datetime(2026, 11, 26, 20, 30, tzinfo=UTC)
LOCAL_DAY = date(2026, 11, 27)


def test_local_date_is_tashkent_day():
    with patch("django.utils.timezone.now", return_value=AFTER_LOCAL_MIDNIGHT):
        assert timezone.localdate() == LOCAL_DAY


def test_grant_starts_and_ends_on_the_tashkent_day(org, make_user, grant):
    starting = make_user("starting")
    ending = make_user("ending")
    grant(starting, Role.RECTOR, valid_from=LOCAL_DAY)
    grant(ending, Role.RECTOR, valid_to=LOCAL_DAY)
    with patch("django.utils.timezone.now", return_value=AFTER_LOCAL_MIDNIGHT):
        assert policy.has_role(starting, Role.RECTOR)
        assert not policy.has_role(ending, Role.RECTOR)
