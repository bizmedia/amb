# [2026-04-24] MIXED — AMB deploy: переход с k8s на SSH/bare-metal

## Контекст:

Все сервисы должны жить на одной машине с единым Caddy. Текущий `amb-app` deploy в `.drone.yml` был k8s-first (migrate job + apply manifests), что расходилось с целевой операционной моделью `mega-retro`/`saas-billing`.

## Решение:

- В `.drone.yml` заменён pipeline `deploy`: вместо `kubectl` шагов добавлен `bare-metal-ssh`.
- Добавлен runtime-набор `ops/bare-metal`:
  - `docker-compose.yml` (upstream-порты shared-host: `3201` web, `4201` api),
  - `bin/remote-pull-and-up.sh`,
  - `bin/run-migration.sh`,
  - `env.example`,
  - `README.md`.
- Деплой теперь делает: sync `ops/bare-metal` -> `/opt/amb-app`, генерацию `.env` из Drone secrets, pull images, миграции, `compose up`.

## Исход:

MIXED — переход реализован в репозитории, но итоговый прод-прогон после смены pipeline и секретов должен быть подтверждён отдельно.

## Паттерн:

При мульти-репо на одном хосте деплой-контур должен быть единообразным (SSH/bare-metal) и опираться на контракт: уникальные loopback-порты, единый Caddy, `.env` только из CI-secrets.

## Правило:

- Канон деплоя: [`.drone.yml`](../../../../.drone.yml), [`ops/bare-metal/`](../../../../ops/bare-metal/).
- Портовой контракт shared-host: web `3201`, api `4201` (AMB).
