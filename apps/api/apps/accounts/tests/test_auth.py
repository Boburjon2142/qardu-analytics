import logging
import time
from io import StringIO
from unittest.mock import patch

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError
from django.db import IntegrityError, transaction

from apps.accounts.models import User
from apps.accounts.tests.conftest import csrf_headers
from apps.audit.models import AuditEvent

pytestmark = pytest.mark.django_db


def test_login_success_sets_hardened_cookies_and_audits(client, user, login):
    r = login()
    assert r.status_code == 200
    assert r.json() == {"id": user.pk, "email": "alice@example.org", "full_name": "Alice Test"}
    session = client.cookies["sessionid"]
    assert session["httponly"] is True
    assert session["samesite"] == "Lax"
    event = AuditEvent.objects.get(action="auth.login", outcome="success")
    assert event.actor_id == user.pk and event.request_id


def test_login_is_email_case_insensitive(user, login):
    assert login(email="ALICE@EXAMPLE.ORG").status_code == 200


def test_wrong_password_and_unknown_user_are_indistinguishable(client, user, login):
    wrong = login(pwd="definitely-wrong")
    unknown = login(email="nobody@example.org")
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()
    assert "sessionid" not in client.cookies


def test_failed_login_audit_stores_digest_not_email_or_password(user, login):
    login(email="nobody@example.org", pwd="super-secret-attempt")
    event = AuditEvent.objects.get(action="auth.login", outcome="failure")
    dump = " ".join(str(v) for v in vars(event).values())
    assert "nobody@example.org" not in dump
    assert "super-secret-attempt" not in dump
    assert len(event.object_id) == 64  # sha256 hex


def test_inactive_user_cannot_login(user, login):
    user.is_active = False
    user.save()
    assert login().status_code == 401


def test_deactivation_invalidates_existing_session(client, user, login):
    assert login().status_code == 200
    assert client.get("/api/v1/auth/me/").status_code == 200
    user.is_active = False
    user.save()
    assert client.get("/api/v1/auth/me/").status_code in (401, 403)


def test_me_requires_authentication(client):
    assert client.get("/api/v1/auth/me/").status_code in (401, 403)


def test_login_without_csrf_token_is_rejected(client, user, password):
    r = client.post(
        "/api/v1/auth/login/", {"email": "alice@example.org", "password": password}, format="json"
    )
    assert r.status_code == 403
    assert r.json()["code"] == "csrf_failed"
    assert "sessionid" not in client.cookies


def test_logout_requires_csrf_then_invalidates_session(client, user, login):
    login()
    assert client.post("/api/v1/auth/logout/").status_code == 403  # no CSRF header
    assert client.get("/api/v1/auth/me/").status_code == 200  # still logged in
    r = client.post("/api/v1/auth/logout/", **csrf_headers(client))
    assert r.status_code == 200
    assert client.get("/api/v1/auth/me/").status_code in (401, 403)
    assert AuditEvent.objects.filter(action="auth.logout", outcome="success").exists()


def test_session_key_rotates_on_login(client, user, login):
    client.get("/api/v1/auth/csrf/")
    before = client.cookies.get("sessionid")
    login()
    assert client.cookies["sessionid"].value != (before.value if before else None)


def test_account_throttle_blocks_brute_force(user, login):
    statuses = [login(pwd=f"wrong-{i}").status_code for i in range(7)]
    assert statuses[:5] == [401] * 5
    assert statuses[5] == 429


def test_absolute_session_timeout(client, user, login):
    login()
    session = client.session
    session["session_started_at"] = time.time() - 13 * 3600
    session.save()
    assert client.get("/api/v1/auth/me/").status_code in (401, 403)


def test_session_without_start_marker_is_rejected(client, user, login):
    login()
    session = client.session
    del session["session_started_at"]
    session.save()
    assert client.get("/api/v1/auth/me/").status_code in (401, 403)


def test_secrets_never_appear_in_responses_or_logs(client, user, password, login, caplog):
    with caplog.at_level(logging.DEBUG):
        r = login()
        me = client.get("/api/v1/auth/me/")
    for body in (r.content.decode(), me.content.decode()):
        assert password not in body
        assert "password" not in body.lower()
    assert password not in caplog.text


def test_request_id_is_echoed_or_generated(client):
    assert (
        client.get("/api/v1/health/", HTTP_X_REQUEST_ID="trace-12345678").headers["X-Request-ID"]
        == "trace-12345678"
    )
    generated = client.get("/api/v1/health/", HTTP_X_REQUEST_ID="bad id!").headers["X-Request-ID"]
    assert generated != "bad id!" and len(generated) == 32


def test_email_is_normalized_and_unique_case_insensitively(db):
    User.objects.create_user(email="  Bob@Example.org ", password=None, full_name="Bob")
    assert User.objects.get(email="bob@example.org").has_usable_password() is False
    with pytest.raises(IntegrityError), transaction.atomic():
        User.objects.create_user(email="BOB@example.org", password=None, full_name="Bob 2")


def test_db_rejects_non_lowercase_email(db):
    with pytest.raises(IntegrityError), transaction.atomic():
        User.objects.bulk_create([User(email="Mixed@Example.org", full_name="X")])


def test_createuser_command_validates_password_policy(db):
    getpass_path = "apps.accounts.management.commands.createuser.getpass"
    with patch(getpass_path, side_effect=["short", "short"]), pytest.raises(CommandError):
        call_command("createuser", email="c@example.org", full_name="C", stdout=StringIO())
    assert not User.objects.filter(email="c@example.org").exists()
    strong = "Correct-Horse-Battery-9"
    with patch(getpass_path, side_effect=[strong, strong]):
        call_command("createuser", email="c@example.org", full_name="C", stdout=StringIO())
    assert User.objects.get(email="c@example.org").check_password(strong)
