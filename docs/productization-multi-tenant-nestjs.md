# План превращения mcp-message-bus в переиспользуемый продукт

Дата: 2026-01-28

Цель: развернуть сервис как отдельный backend (Nest.js), добавить JWT-авторизацию, поддержать multi-tenant (tenant -> projects), использовать один сервис для нескольких проектов, при этом сохранить Dashboard как часть продукта.

---

## Зафиксированные требования

- Backend: отдельный сервер Nest.js (не Next.js API).
- Авторизация: сразу JWT.
- Доступ: токены/ключи на **project** (в JWT зашит `projectId`).
- Тенантность: много tenant'ов, у каждого tenant много проектов.
- Dashboard: часть продукта (Next.js UI), но без прямого доступа к БД.
- `.cursor/agents`: проектно-специфичная папка, не входит в продуктовую поставку и не является переиспользуемым слоем.

См. также:
- `docs/productization-multi-tenant-implementation-plan.md` (baseline план реализации по фазам/итерациям)
- `docs/qa-plan-productization-multi-tenant.md` (QA стратегия и минимальная матрица для MVP)

---

## Целевая архитектура (монорепа)

Разделяем продукт на приложения и пакеты, чтобы код можно было переиспользовать и версионировать.

```
apps/
  api/                  # Nest.js API + auth + workers + RLS context
  web/                  # Next.js Dashboard (HTTP клиент к apps/api)
packages/
  core/                 # доменная логика (threads/messages/inbox/dlq), без Nest/Next
  db/                   # Prisma schema/migrations + prisma client + RLS helpers
  shared/               # общие типы/ошибки/схемы (zod), константы
  sdk/                  # TS SDK для внешних проектов (createClient)
  mcp-server/           # MCP сервер, использует packages/sdk
```

Принципы зависимостей:

- `apps/api` -> `packages/core`, `packages/db`, `packages/shared`
- `apps/web` -> `packages/sdk` (или тонкий web-client), без Prisma
- `packages/sdk` -> `packages/shared`
- `packages/core` -> `packages/shared` (и интерфейс к хранилищу, без прямого Prisma)

---

## Модель данных (tenant -> projects -> данные)

Сущности верхнего уровня:

- `Tenant(id, slug, name, status, createdAt, ...)`
- `Project(id, tenantId, slug, name, status, createdAt, ...)`

Сущности шины сообщений должны быть **project-scoped**:

- `Agent(projectId, ...)`
- `Thread(projectId, ...)`
- `Message(projectId, ...)`

Для RLS и производительности часто выгодно денормализовать `tenantId` также в рабочие таблицы:

- `Agent(tenantId, projectId, ...)`
- `Thread(tenantId, projectId, ...)`
- `Message(tenantId, projectId, ...)`

Индексы ориентировать на ключевые запросы (inbox/dlq/polling):

- `projectId, status, createdAt`
- `projectId, toAgentId, status`
- при денормализации: `tenantId, projectId, ...`

Миграция текущих данных:

- создать `default tenant` + `default project`
- проставить им `tenantId/projectId` для всех существующих записей

---

## JWT и модель доступа "токен на project"

JWT claims минимум:

- `sub` (user/service)
- `tenantId`
- `projectId`
- `roles` (опционально: admin/reader и т.п.)
- `iss`, `aud`, `exp`

Поскольку токен на project, проектный контекст **не должен** зависеть от заголовков/параметров запроса: `projectId` берется из JWT.

Нужно предусмотреть два типа токенов:

- **User tokens** (для Dashboard)
- **Service tokens** (machine-to-machine интеграции для внешних проектов)

---

## RLS (Postgres) как defense-in-depth

Цель: даже если в приложении забыли добавить фильтр по tenant/project, база не даст прочитать/изменить чужие строки.

Подход:

1) Включить RLS на таблицах (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
2) Политики `USING` / `WITH CHECK` сравнивают колонки строки с контекстом сессии:

- `current_setting('app.tenant_id', true)`
- `current_setting('app.project_id', true)`

3) В `apps/api` (Nest) **обязательно** выставлять контекст БД на каждый запрос.

Важно про Prisma:

- контекст должен выставляться в том же соединении, в котором выполняются запросы
- практичный способ: выполнять обработку запроса в транзакции и делать `SET LOCAL ...` внутри нее

Админские операции (миграции, внутренние джобы) обычно выполняются через отдельную DB роль с `BYPASSRLS` или отдельное соединение/процесс.

---

## API (Nest.js) и версионирование

- Ввести `/v1/...` сразу (контракты становятся продуктом).
- Все endpoints project-scoped через JWT.
- Admin endpoints (под admin role): управление tenant/project и выпуск project-токенов.

Публичные доменные разделы (ориентировочно 1:1 с текущим API):

- Agents
- Threads
- Messages (send/inbox/ack)
- DLQ (list/retry/retry-all)

---

## Dashboard как продукт (Next.js)

- `apps/web` общается с `apps/api` только по HTTP.
- Prisma и прямой доступ к БД в `apps/web` отсутствуют.
- Auth в UI: рекомендуется использовать httpOnly cookies + refresh flow (для снижения рисков утечки токена), либо иной согласованный вариант.

---

## DX (Developer Experience) для многопроектного использования

Что должен уметь новый пользователь продукта:

1) поднять сервис локально/в окружении (docker compose)
2) создать tenant + project
3) выпустить project JWT (или получить через login)
4) подключить SDK в свой проект и начать слать/читать сообщения

SDK:

- `createClient({ baseUrl, token })`
- единые ошибки/типы из `packages/shared`

Команды верхнего уровня:

- `pnpm dev` (db + api + web)
- `pnpm test` (unit(core) + integration(api+db) + sdk smoke)
- `pnpm db:migrate`, `pnpm db:reset` (из корня)

Документация:

- отдельные гайды: "Service deploy", "Integrate SDK", "Admin (tenants/projects/tokens)", "RLS & security"

---

## План миграции (по фазам)

Фаза 1: выделение пакетов без изменения поведения

- вынести `shared/core/db/sdk` в `packages/`
- убедиться, что текущий функционал работает

Фаза 2: поднять Nest API параллельно

- создать `apps/api` и перенести endpoints 1:1
- временно разрешить доступ без RLS, но уже вводить project scoping в коде

Фаза 3: tenant/projects + миграция данных

- добавить Prisma модели `Tenant` и `Project`
- добавить `tenantId/projectId` в рабочие таблицы + backfill в default tenant/project

Фаза 4: JWT auth + project tokens

- добавить JWT guard и извлечение `tenantId/projectId`
- обновить SDK/MCP на передачу JWT

Фаза 5: включить RLS

- включить RLS + политики
- перевести доступ к Prisma на "scoped transaction" с `SET LOCAL ...`

Фаза 6: переключить Dashboard на Nest API

- `apps/web` использует `apps/api`
- удалить остатки DB доступа из Next приложения

Фаза 7: деплой и эксплуатация

- docker/compose/helm (по выбранной инфраструктуре)
- миграции при релизе
- observability (логи/метрики/алерты), rate limiting

---

## Открытые вопросы (для следующего шага)

- Где будет хоститься сервис (VPS/облако/k8s)?
- Какой login для user tokens (свой users table или внешний IdP)?
- Какие роли нужны (tenant-admin, project-admin, reader)?
- Воркеры (retry/cleanup) будут единые на весь сервис или шардированные?
