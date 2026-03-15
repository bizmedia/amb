#!/usr/bin/env sh
set -eu

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-file.dump>" >&2
  exit 1
fi

BACKUP_FILE="$1"
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

if [ -n "${DATABASE_URL:-}" ]; then
  pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" "$BACKUP_FILE"
else
  pg_restore \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    -h "${PGHOST:-localhost}" \
    -p "${PGPORT:-5433}" \
    -U "${PGUSER:-postgres}" \
    -d "${PGDATABASE:-amb}" \
    "$BACKUP_FILE"
fi

echo "restore_completed_from=$BACKUP_FILE"
