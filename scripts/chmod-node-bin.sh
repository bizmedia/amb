#!/usr/bin/env bash
# Восстанавливает +x на шимы в node_modules/.bin (после install в Docker на bind-mount
# иногда остаются права 600 без execute).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
find . -name .git -prune -o \
  -path '*/node_modules/.bin/*' \( -type f -o -type l \) -exec chmod +x {} + 2>/dev/null || true
