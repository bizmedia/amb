# Feature Workflow: Epic 2 — Multi-tenant инфраструктура

**Тред:** feature-workflow  
**Открыт:** 2026-03-15  
**Оркестратор:** orchestrator  
**Статус:** ✅ Завершён  

**Message Bus (MCP):** тред создан; задачи разосланы **Backend** (nest-engineer) и **Frontend** (react-next-engineer).  

- **Thread ID:** `66ddc5d9-baa6-4040-ae1e-a51d19988e25`  
- **Статус треда:** closed (2026-03-15)  
- Backend E2-S1: `bc11f422-…` | Frontend (queued): `991a49b8-…`

---

## Цель

Реализовать модель Tenant → Projects с изоляцией данных (project-scoped API, RLS, контекст в запросах).

---

## Распределение: Backend / Frontend


| Область      | Стек                                   | Агент в Cursor                | В message bus                |
| ------------ | -------------------------------------- | ----------------------------- | ---------------------------- |
| **Backend**  | apps/api, packages/db, Prisma, Nest.js | nest-engineer (или dev)       | Dev (payload.area: backend)  |
| **Frontend** | apps/web, Next.js, Dashboard           | react-next-engineer (или dev) | Dev (payload.area: frontend) |


---

## Порядок работ (зависимости)


| Шаг | Story | Описание                                                         | Область  | Агент                     | Статус         |
| --- | ----- | ---------------------------------------------------------------- | -------- | ------------------------- | -------------- |
| 1   | E2-S1 | Tenant и Project модели (Prisma)                                 | Backend  | nest-engineer / Dev       | ✅ Done        |
| 2   | E2-S2 | tenantId/projectId в таблицах Agent, Thread, Message             | Backend  | nest-engineer / Dev       | ✅ Done        |
| 3   | E2-S3 | Backfill существующих данных                                     | Backend  | nest-engineer / Dev       | ✅ Done        |
| 4   | E2-S4 | Project-scoped API endpoints                                     | Backend  | nest-engineer / Dev       | ✅ Done        |
| 5   | E2-S5 | RLS политики в PostgreSQL                                        | Backend  | nest-engineer / Dev       | ✅ Done        |
| 6   | E2-S6 | Контекст tenant/project в запросах                               | Backend  | nest-engineer / Dev       | ✅ Done        |
| —   | (E2)  | Поддержка project/tenant в Dashboard (если понадобится в Epic 2) | Frontend | react-next-engineer / Dev | 📋 По запросу  |


---

## Контекст

- **Backlog:** [docs/backlog.md](./backlog.md) — Epic 2, E2-S1…E2-S6  
- **ADR:** [docs/adr/ADR-006-multi-tenant-model.md](./adr/ADR-006-multi-tenant-model.md), [docs/adr/ADR-008-postgres-rls.md](./adr/ADR-008-postgres-rls.md)  
- **Схема/миграции:** packages/db (Prisma); API — apps/api (Nest.js).

---

## Разданные задачи


| Область      | Агент                     | Задача                                      | Story       | Статус        |
| ------------ | ------------------------- | ------------------------------------------- | ----------- | ------------- |
| **Backend**  | nest-engineer / Dev       | Tenant/Project модели                       | E2-S1       | ✅ Done       |
| **Backend**  | nest-engineer / Dev       | tenantId/projectId в таблицах               | E2-S2       | ✅ Done       |
| **Backend**  | nest-engineer / Dev       | Backfill данных                             | E2-S3       | ✅ Done       |
| **Backend**  | nest-engineer / Dev       | Project-scoped API                         | E2-S4       | ✅ Done       |
| **Backend**  | nest-engineer / Dev       | RLS политики                               | E2-S5       | ✅ Done       |
| **Backend**  | nest-engineer / Dev       | Контекст tenant/project в запросах         | E2-S6       | ✅ Done       |
| **Frontend** | react-next-engineer / Dev | UI tenant/project (если в рамках Epic 2)    | —           | 📋 По запросу |
| —            | Architect                 | По запросу (модель, RLS, контекст)          | —           | 📋 On demand  |
| —            | QA                        | Проверки после stories                      | —           | 📋 Queued     |


**Детали:** [docs/agent-tasks-epic-2.md](./agent-tasks-epic-2.md)

---

## Отслеживание

- Завершение story → обновить [backlog.md](./backlog.md) и эту таблицу.  
- Блокеры → эскалировать пользователю / Architect.  
- **MCP:** тред `66ddc5d9-baa6-4040-ae1e-a51d19988e25` (closed). Агенты: nest-engineer `d0e135a6-…`, react-next-engineer `72c8cb90-…`, Dev `67600e80-…`, Architect `d6703179-…`, QA `aa052ead-…`.

