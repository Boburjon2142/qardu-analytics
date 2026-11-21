# apps/api — Django + DRF

Status: Phase 2.1 (identity foundation). Custom email-login `User`, DB sessions, CSRF, login
throttling, append-only `AuditEvent`, deny-by-default `policy` shell. No roles, organization or
RBAC yet (2.2–2.4).

## Local setup (Windows, Python 3.14)
```powershell
cd apps/api
py -3.14 -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements/dev.txt
copy .env.example .env   # then edit values; never commit .env
```
`config.settings.local` loads `.env` itself (real environment variables win). Set a real
`POSTGRES_PASSWORD` and `DJANGO_SECRET_KEY` there, then create the dev role + database **yourself**
(prompts for the `postgres` superuser password; dev only, grants `CREATEDB` for test databases):
```powershell
powershell -ExecutionPolicy Bypass -File scripts\dev-db-setup.ps1
```
`manage.py runserver` checks migrations and therefore needs this reachable PostgreSQL.

## Users
No self-registration and no default accounts. Create one interactively (password prompt, policy
validated, never an argument): `python manage.py createuser --email a@b.uz --full-name "Name"`.

## Migrations
Applying migrations to the dev database needs the owner's explicit approval (CLAUDE.md §7).
`pytest` creates and drops a temporary `test_*` database; the DB role needs `CREATEDB`.

## Checks
```powershell
$env:DJANGO_SECRET_KEY="x"; .\.venv\Scripts\python manage.py check
.\.venv\Scripts\python -m pytest
.\.venv\Scripts\python -m ruff check .
```

## Endpoints (all `/api/v1/`)
- `GET auth/csrf/` — sets the CSRF cookie (send it back as `X-CSRFToken`).
- `POST auth/login/` — `{email, password}`; CSRF + throttled (5/min per account, 30/min per IP).
- `POST auth/logout/`, `GET auth/me/` — session required.
- `GET health/` — liveness, no DB.
- `GET health/ready/` — PostgreSQL reachability (503 without details on failure).
- `GET version/` — API and app version.

DRF defaults are deny-by-default (`SessionAuthentication` + `IsAuthenticated`, JSON-only); public
endpoints must opt in explicitly. Login/CSRF/session values (30 min idle, 12 h absolute, password
min 12) are Proposed and approved as P2-5; per-IP trusts `REMOTE_ADDR` only until Nginx is set up.

## Not yet decided / not done
Production settings, request-ID/error envelope, OpenAPI schema, CI, Docker, PostgreSQL 18 target
(local machine has PostgreSQL 16, which Django 6.1 supports).
