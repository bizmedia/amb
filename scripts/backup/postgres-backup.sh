#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/amb-$TIMESTAMP.dump"

mkdir -p "$BACKUP_DIR"

if [ -n "${DATABASE_URL:-}" ]; then
  pg_dump "$DATABASE_URL" -Fc -f "$FILE"
else
  pg_dump \
    -h "${PGHOST:-localhost}" \
    -p "${PGPORT:-5433}" \
    -U "${PGUSER:-postgres}" \
    -d "${PGDATABASE:-amb}" \
    -Fc \
    -f "$FILE"
fi

echo "backup_created=$FILE"
