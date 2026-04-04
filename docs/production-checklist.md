# Чеклист перед продакшеном (AMB)

Краткий список перед выкатом или при приёмке нового окружения.

## Сборка и артефакты

- [ ] Код в целевой ветке (например `main`), при необходимости поднята **версия** в `package.json` для тегов образов.
- [ ] CI зелёный: **API lint**, **typecheck**, **e2e** (см. `.github/workflows/api-ci.yml`).
- [ ] Собраны и выкатаны образы **`amb-api`** и **`amb-web-ui`** (Docker Hub / свой registry) с **одинаковым тегом** (commit SHA или semver).

## База данных

- [ ] Выделена управляемая PostgreSQL, строка **`DATABASE_URL`** с нужным `sslmode` (часто `require` у облачных провайдеров).
- [ ] На продовой БД выполнен **`pnpm db:migrate:deploy`** (в образе API это делается при старте контейнера — см. `Dockerfile.api`; при k8s возможен отдельный Job).
- [ ] Настроены **резервные копии** и понятен порядок восстановления (см. `docs/disaster-recovery-runbook.md`).

## Секреты и конфигурация API

- [ ] **`JWT_SECRET`**: длинная случайная строка (например `openssl rand -hex 32`), не совпадает с dev.
- [ ] **`PORT`**: при необходимости переопределён; по умолчанию `3334`.
- [ ] **`NODE_ENV=production`**: выставлен в runtime-образе API (`Dockerfile.api`).
- [ ] **`AMB_BOOTSTRAP`**: на **первом** деплое можно `true` (создаётся только default **tenant**), затем переключить на **`false`**, чтобы не дергать upsert при каждом рестарте.
- [ ] Swagger в проде **выключен** по умолчанию. Включить явно: **`AMB_SWAGGER_ENABLED=true`** (только если осознанно нужен публичный `/api/docs`).

## Web (Dashboard / BFF)

- [ ] **`API_URL`** указывает на **HTTP API** (внутренний или публичный URL до Nest), а не на статику фронта, если они разделены.
- [ ] Домены и TLS (Caddy / ingress) настроены под ваши **`WEB_DOMAIN`** / **`API_DOMAIN`**.

## Учётные записи и проекты

- [ ] **Дефолтного пользователя нет**: первый вход через **регистрацию** в Dashboard, затем **создание проекта** вручную.
- [ ] Для MCP/интеграций выданы **project tokens** из Dashboard при необходимости.

## После выката

- [ ] `GET /api/health` отвечает успешно.
- [ ] Регистрация → вход → создание проекта → базовые сценарии Dashboard.
- [ ] (Опционально) при включённом Swagger — `GET /api/docs-json` или UI по `/api/docs`.

## Полезные ссылки

- [Runbook разработчика](developer-runbook.md)
- [Хостинг compose](../deploy/compose/docker-compose.hosting.yml) и пример env: [`deploy/compose/.env.hosting.example`](../deploy/compose/.env.hosting.example)
- [Скрипт хостинга](../scripts/deploy/hosting-deploy.sh): `pnpm deploy:hosting` (при настроенном `deploy/compose/.env.hosting`)
