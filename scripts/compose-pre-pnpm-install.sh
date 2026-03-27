#!/bin/sh
# Перед pnpm install в контейнере (bind-mount репозитория с хоста): Prisma generate
# в postinstall @amb-app/db падает с EEXIST при mkdir .../src/generated/models,
# если каталог уже существует с macOS-хоста. Удаляем сгенерённый клиент — он
# пересоздаётся в postinstall.
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
rm -rf packages/db/src/generated
