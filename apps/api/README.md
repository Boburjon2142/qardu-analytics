# apps/api — Django + DRF (Phase 1 skeleton)

Status: skeleton only. No models, migrations, authentication or RBAC yet (Phase 2).

## Local setup (Windows, Python 3.14)
```powershell
cd apps/api
py -3.14 -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements/dev.txt
copy .env.example .env   # then edit values; never commit .env
```
`manage.py runserver` checks migrations and therefore needs a reachable PostgreSQL
(`POSTGRES_*` variables). The database must be created by the owner; this repo does not create it.

## Checks
```powershell
$env:DJANGO_SECRET_KEY="x"; .\.venv\Scripts\python manage.py check
.\.venv\Scripts\python -m pytest
.\.venv\Scripts\python -m ruff check .
```

## Endpoints (all `/api/v1/`)
- `GET health/` — liveness, no DB.
- `GET health/ready/` — PostgreSQL reachability (503 without details on failure).
- `GET version/` — API and app version.

DRF defaults are deny-by-default (`IsAuthenticated`, no authentication classes) until Phase 2;
public endpoints must opt in explicitly.

## Not yet decided / not done
Production settings, request-ID/error envelope, OpenAPI schema, CI, Docker, PostgreSQL 18 target
(local machine has PostgreSQL 16, which Django 6.1 supports).
