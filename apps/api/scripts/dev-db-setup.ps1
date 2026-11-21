# Creates the LOCAL DEV role and database from apps/api/.env (idempotent).
# Run it yourself: it prompts for the PostgreSQL superuser ("postgres") password.
# The role password is sent via stdin, never on the command line. Dev only.
param(
    [string]$PsqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    [string]$SuperUser = "postgres"
)
$ErrorActionPreference = "Stop"
$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) { throw ".env not found. Copy .env.example to .env first." }

$cfg = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([A-Z_]+)=(.*)$') { $cfg[$Matches[1]] = $Matches[2] }
}
foreach ($k in 'POSTGRES_DB','POSTGRES_USER','POSTGRES_PASSWORD','POSTGRES_HOST','POSTGRES_PORT') {
    if (-not $cfg[$k]) { throw "Missing $k in .env" }
}
foreach ($k in 'POSTGRES_DB','POSTGRES_USER') {
    if ($cfg[$k] -notmatch '^[a-z_][a-z0-9_]*$') { throw "$k must match [a-z_][a-z0-9_]*" }
}
if ($cfg.POSTGRES_PASSWORD -like 'change-me*') { throw "Set a real POSTGRES_PASSWORD in .env first." }

$db = $cfg.POSTGRES_DB; $user = $cfg.POSTGRES_USER
$pw = $cfg.POSTGRES_PASSWORD.Replace("'", "''")
$sql = @"
DO `$`$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$user') THEN
    CREATE ROLE $user LOGIN CREATEDB PASSWORD '$pw';
  ELSE
    ALTER ROLE $user LOGIN CREATEDB PASSWORD '$pw';
  END IF;
END `$`$;
SELECT 'CREATE DATABASE $db OWNER $user' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db') \gexec
"@
$sql | & $PsqlPath -h $cfg.POSTGRES_HOST -p $cfg.POSTGRES_PORT -U $SuperUser -d postgres -v ON_ERROR_STOP=1 -f -
if ($LASTEXITCODE -ne 0) { throw "psql failed (exit $LASTEXITCODE)" }
Write-Host "OK: role '$user' and database '$db' are ready."
