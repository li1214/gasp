#!/bin/sh
set -eu

PROJECT_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

if [ ! -f ".env" ]; then
  echo "Missing .env file. Create it from .env.example first."
  echo "Example: cp .env.example .env"
  exit 1
fi

# Export all variables from .env for the deploy command.
# Strip UTF-8 BOM on the first line if present to avoid shell parse errors.
BOM="$(printf '\357\273\277')"
TEMP_ENV_FILE=".env.__publish_tmp"
trap 'rm -f "$TEMP_ENV_FILE"' EXIT INT TERM
{
  IFS= read -r first_line || first_line=""
  printf '%s\n' "${first_line#"$BOM"}"
  cat
} < ".env" > "$TEMP_ENV_FILE"

set -a
. "./$TEMP_ENV_FILE"
set +a

if [ "${DEPLOY_PASSWORD:-}" = "change_me" ] || [ "${DEPLOY_DB_PASSWORD:-}" = "change_me" ]; then
  echo "DEPLOY_PASSWORD / DEPLOY_DB_PASSWORD is still 'change_me' in .env."
  echo "Please set real credentials, then run: npm run publish"
  exit 1
fi

PYTHON_BIN=".venv/bin/python"

if [ ! -x "$PYTHON_BIN" ]; then
  echo "Creating Python virtual environment at .venv ..."
  python3 -m venv .venv
fi

if ! "$PYTHON_BIN" -c "import paramiko" >/dev/null 2>&1; then
  echo "Installing missing dependency: paramiko ..."
  "$PYTHON_BIN" -m pip install paramiko
fi

exec "$PYTHON_BIN" scripts/deploy_server.py \
  --host "${DEPLOY_HOST:?DEPLOY_HOST is required}" \
  --user "${DEPLOY_USER:?DEPLOY_USER is required}" \
  --password "${DEPLOY_PASSWORD:?DEPLOY_PASSWORD is required}" \
  --port "${DEPLOY_PORT:-3001}" \
  --db-host "${DEPLOY_DB_HOST:-127.0.0.1}" \
  --db-user "${DEPLOY_DB_USER:-root}" \
  --db-password "${DEPLOY_DB_PASSWORD:?DEPLOY_DB_PASSWORD is required}" \
  --db-name "${DEPLOY_DB_NAME:-sgzz_market}"
