#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
test -f .env
test -f .env.images
set -a
# shellcheck source=/dev/null
source .env.images
set +a
: "${AMB_API_IMAGE?}"

docker run --rm \
  --env-file .env \
  "$AMB_API_IMAGE" \
  sh -lc "pnpm db:migrate:deploy"
