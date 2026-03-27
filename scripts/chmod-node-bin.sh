#!/bin/sh
# Восстанавливает +x на шимы в node_modules/.bin (после install в Docker на bind-mount
# иногда остаются права 600 без execute). POSIX sh — работает в node:*-alpine без bash.
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1
find . -name .git -prune -o \
  -path '*/node_modules/.bin/*' \( -type f -o -type l \) -exec chmod +x {} + 2>/dev/null || true
