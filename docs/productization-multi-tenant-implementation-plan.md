# Productization Multi‑Tenant (NestJS) — Implementation Plan

Дата: 2026-01-28  
Статус: draft (baseline для утверждения)

Этот документ консолидирует: требования PO, инженерный план по фазам, и точки интеграции QA/DevOps/Docs для MVP vNext.

См. также:
- `docs/productization-multi-tenant-nestjs.md` (контекст/целевая архитектура/принципы)
- `docs/multi-tenant-architecture-options.md` (варианты изоляции, target = Postgres + RLS)
- `docs/qa-plan-productization-multi-tenant.md` (QA стратегия/матрица для P0)

---

## Зафиксированные решения (PO)

1) **API = `/v1` only** (legacy не поддерживаем в MVP).
2) **User access-token содержит ровно один `projectId`**; смена проекта = выпуск нового access-token; никаких header/query для выбора проекта.
3) **Project/service tokens = JWT**; для revoke/rotation в MVP допускается DB-backed проверка статуса по `jti`/id (требование: быстрый revoke).
4) **Retention/cleanup (TTL) = P1**, но в MVP закладываем дизайн/hooks (поля/индексы/cron точки).
5) **Rate limiting = P1** (поднимаем в P0 при external beta/public).
6) **Audit logging (минимум MVP)**: token issued/revoked, tenant/project create/update, DLQ retry/retry-all. (message sent/acked = P1, если нет compliance требований).

---

## Цели vNext (P0)

- Разделить монорепу на `apps/api` (Nest) и `apps/web` (Next Dashboard), исключить прямой доступ Dashboard к БД.
- Перевести доменные данные в **project-scoped** модель: `Tenant → Project → domain tables`.
- Ввести JWT auth (user + project/service) и строгий project resolution только из claims.
- Включить Postgres RLS как defense-in-depth (после кодового scoping и миграции данных).
- Сохранить/задокументировать семантику ключевых операций: send, inbox poll/SSE, ack, DLQ, retry.

## Non-goals (P0)

- Billing/pricing, SSO, advanced RBAC, multi-region, enterprise-tier физическая изоляция (DB-per-tenant).
- `.cursor/agents` как часть продуктовой поставки.

---

## План по фазам

Оценки ниже — грубые (dev-days), без учёта параллельной работы команд и буфера на интеграцию.

### Phase 0 — ADR + контракты (2–4d)

Deliverables:
- ADR: multi-tenancy isolation model (target = Postgres + RLS), DB choice, scoping helper, JWT claims/token types, admin plane минимум, worker scoping.
- Контракт `/v1` (OpenAPI/typed client) и error mapping (формат ошибок/коды).

Acceptance:
- ADR утверждены, зафиксированы решения PO, определён набор `/v1` endpoints.

### Phase 1 — Packages без изменения поведения (5–8d)

Цель: отделить доменную логику от фреймворков и БД-деталей.

Deliverables:
- `packages/core`: use-cases (send/inbox/ack/dlq/retry) + интерфейсы репозиториев.
- `packages/db`: Prisma schema/migrations + адаптеры репозиториев + задел под scoping/RLS.
- `packages/shared`: ids/errors/zod schemas/pagination/const.
- `packages/sdk`: typed client + auth plumbing (без прямого доступа к Prisma).

Acceptance:
- Текущие сценарии работают без изменения поведения (сравнение ответов/ошибок).

### Phase 2 — Nest API параллельно (3–6d)

Deliverables (`apps/api`):
- `HealthModule`: `/health`, `/ready`.
- `V1Module` + модули предметной области: messages, inbox (poll + SSE), ack, dlq, retry.
- Единый error mapping и request correlation id.

Acceptance:
- `/v1` покрывает ключевые операции 1:1 по семантике.

### Phase 3 — Tenant/Project модель + миграция данных (8–12d)

Deliverables (Postgres):
- Таблицы верхнего уровня: `tenants`, `projects`.
- Доменные таблицы получают `tenantId/projectId` (с денормализацией `tenantId` в project-scoped таблицах).
- Миграции в 2 шага:
  - M1: добавить nullable `tenantId/projectId` + индексы
  - backfill: создать default tenant/project и проставить всем существующим строкам
  - M2: сделать NOT NULL + FK + уникальности + финальные индексы
- Вся доменная логика уже фильтрует по `projectId` из контекста **до** RLS.

Acceptance:
- Все существующие данные доступны в default project после backfill; нет orphan rows.
- Проверяемые кейсы изоляции на уровне бизнес-сценариев (даже без RLS).

### Phase 4 — JWT auth + токены (10–16d)

Deliverables:
- JWT user auth для Dashboard: access-token содержит ровно один `projectId`.
- JWT project/service tokens (integrations): claims включают `tenantId/projectId`, `type=project`, `jti`.
- Быстрый revoke/rotation:
  - Хранилище статуса по `jti`/token id в БД (`revokedAt`, `lastUsedAt`).
  - Проверка статуса на запрос (DB-backed).
- Минимальный admin plane (API, UI можно позже):
  - tenant/project create/update
  - issue/revoke tokens

Acceptance:
- `tenantId/projectId` берутся только из JWT claims.
- Revoke действует в согласованный SLA (нужно зафиксировать целевое значение, например ≤30s).

### Phase 5 — Postgres RLS (5–8d)

Deliverables:
- RLS включён на всех project-scoped таблицах.
- Стандартизованный механизм DB scoping:
  - на каждый запрос/джоб: `SET LOCAL app.tenant_id = ...; SET LOCAL app.project_id = ...;` в том же соединении (через scoped transaction helper).
- Интеграционные тесты изоляции: попытки доступа к чужому project либо дают 0 rows, либо DB permission error.

Acceptance:
- Defense-in-depth подтверждён: даже при «забытом фильтре» БД блокирует доступ вне scope.

### Phase 6 — Dashboard на Nest API (8–15d)

Deliverables (`apps/web`):
- Web общается с `apps/api` только по HTTP.
- UI сценарии: inbox, DLQ, retry, token management (минимум).
- SSE inbox live updates + fallback polling.
- Project switch = получение нового access-token (без header/query project selection).

Acceptance:
- E2E сценарии Web→API проходят для основных операций.

### Phase 7 — Эксплуатация (3–8d)

Deliverables:
- Runbook: миграции при релизе, seed default tenant/project.
- Базовые health checks + конфиг (env schema).
- Логирование контекста (requestId, tenantId, projectId, actor).

Acceptance:
- Воспроизводимый запуск в окружениях + безопасные миграции.

---

## Backlog (грубые оценки и зависимости)

P0:
1) Packages (`core/db/shared/sdk`) (5–8d) — блокирует API/Web.
2) `apps/api` каркас + `/v1` endpoints (3–6d) — зависит от (1).
3) Tenant/Project + миграции + backfill (8–12d) — зависит от (1), (2).
4) JWT user auth (5–8d) — зависит от (2), (3).
5) JWT project tokens + revoke (5–8d) — зависит от (3), (4).
6) RLS + scoping helper + tests (5–8d) — зависит от (3).
7) SSE inbox + polling fallback (3–6d) — зависит от (2).
8) Web → API миграция + UI (8–15d) — зависит от (2), (4), (5).
9) Ops/runbook/config (3–8d) — зависит от (2), (3).

P1:
- Rate limiting per-project (2–4d) (поднять в P0 при external beta/public).
- Retention/cleanup (TTL) (5–10d) (реализация cron/worker + политики хранения).
- Audit расширение (message sent/acked, role changes, login/refresh — при необходимости).

---

## Конфиг и feature flags (минимум)

Рекомендуемые переключатели (env):
- `AUTH_ENABLED` (локально можно отключать)
- `RLS_ENABLED` (включение/валидация политик; в prod должен быть `true`)
- `AUDIT_ENABLED` (минимум событий в MVP)
- `RATE_LIMIT_ENABLED` (P1)

JWT:
- `JWT_ISSUER`, `JWT_AUDIENCE`
- `JWT_PUBLIC_KEY`/`JWT_PRIVATE_KEY` (или `JWT_SECRET` для HS* — решение через ADR)
- `JWT_ACCESS_TTL_SECONDS`

DB:
- `DATABASE_URL` (Postgres)

---

## Риски и меры

1) **Cross-project leakage** (критический)  
Меры: строгий контекст из JWT, запрет projectId из запроса, RLS + интеграционные тесты изоляции.

2) **Prisma + RLS контекст не в том соединении**  
Меры: scoped transaction helper + правило «нет Prisma-запросов вне scope».

3) **Revoke/rotation latency**  
Меры: зафиксировать SLA и реализовать DB-backed проверку `jti`, добавить тесты на revoke.

4) **SSE масштабирование (multi-instance)**  
Меры: в MVP допускаем single-instance; для P1 рассмотреть pub/sub (Redis) и sticky sessions.

---

## Следующие шаги (после утверждения baseline)

1) Утвердить ADR и значения SLA (revoke) + минимальные `/v1` endpoints.
2) Согласовать структуру QA артефактов: `docs/qa-plan-productization-multi-tenant.md`.
3) Получить от DevOps решение по окружениям Postgres+RLS и runbook миграций.
