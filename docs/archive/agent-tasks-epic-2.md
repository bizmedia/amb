# Задачи агентов: Epic 2 — Multi-tenant инфраструктура

**Обновлено:** 2026-03-15 (Orchestrator)  
**Тред:** [feature-workflow-epic-2.md](./feature-workflow-epic-2.md)  
**Message Bus:** тред `66ddc5d9-baa6-4040-ae1e-a51d19988e25`

**Конвенция:** Задачи разделены по **Backend** (apps/api, packages/db) и **Frontend** (apps/web). В Cursor используйте агентов **nest-engineer** (backend) и **react-next-engineer** (frontend); в message bus пока один Dev — в payload указывается `area: backend | frontend`.

---

## Backend (nest-engineer / Dev)

**Область:** apps/api, packages/db, Prisma, Nest.js

### Текущая задача: E2-S1 — Tenant и Project модели

**Статус:** 🚧 Assigned | **area:** backend

**Сделать:**
1. В `packages/db/prisma/schema.prisma` добавить модели `Tenant` и `Project` (связь Tenant has many Project).
2. Создать миграцию.
3. Настроить relations (Project принадлежит Tenant; привязать существующую модель Project к Tenant при необходимости).

**AC:** Prisma модели Tenant и Project; миграция создана и применяется; relations настроены.  
**Справочно:** [ADR-006](../adr/ADR-006-multi-tenant-model.md), [backlog](../product/backlog.md) Epic 2.

### Очередь (Backend)

| Story   | Задача |
|--------|--------|
| E2-S2  | tenantId/projectId в Agent, Thread, Message; индексы; миграция |
| E2-S3  | Backfill: default tenant + default project; проставить tenantId/projectId |
| E2-S4  | Project-scoped API: фильтрация по projectId; тесты изоляции |
| E2-S5  | RLS в PostgreSQL: политики USING/WITH CHECK; тесты RLS |
| E2-S6  | Контекст в запросах: SET LOCAL app.tenant_id / app.project_id; Prisma middleware |

---

## Frontend (react-next-engineer / Dev)

**Область:** apps/web, Next.js, Dashboard

В Epic 2 основной объём — backend. Задачи для frontend появятся при необходимости (например, UI выбора tenant/project, отображение контекста). Пока — **по запросу** после E2-S4/E2-S6.

---

## Architect Agent

**По запросу / блокерам:** модель Tenant/Project; RLS (E2-S5); контекст (E2-S6). ADR: [ADR-006](../adr/ADR-006-multi-tenant-model.md), [ADR-008](../adr/ADR-008-postgres-rls.md).

---

## QA Agent

**После stories:** миграция E2-S1; тесты изоляции E2-S4; тесты RLS E2-S5; изоляция запросов E2-S6.
