#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if command -v podman >/dev/null 2>&1; then
  COMPOSE="podman compose"
elif command -v docker >/dev/null 2>&1; then
  COMPOSE="docker compose"
else
  echo "Neither podman nor docker is installed" >&2
  exit 1
fi

echo "[deploy] using: $COMPOSE"
echo "[deploy] starting postgres"
$COMPOSE up -d postgres

echo "[deploy] applying migrations"
$COMPOSE run --rm api sh -lc "corepack enable && pnpm install --frozen-lockfile && pnpm db:migrate:deploy"

echo "[deploy] starting api + web"
$COMPOSE up -d api web

echo "[deploy] waiting for health endpoint"
HEALTH_URL="${HEALTH_URL:-http://localhost:${API_PORT:-3334}/api/health}"
attempt=0
max_attempts=30
until curl -fsS "$HEALTH_URL" >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "[deploy] health check failed: $HEALTH_URL" >&2
    exit 1
  fi
  sleep 2
done

echo "[deploy] success"
