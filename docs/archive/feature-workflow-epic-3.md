# Feature Workflow: Epic 3 — JWT авторизация

**Тред:** feature-workflow  
**Открыт:** 2026-03-15  
**Оркестратор:** orchestrator  
**Статус:** ✅ Завершён  

**Message Bus (MCP):** тред создан; задачи разосланы **Backend** (nest-engineer). Все E3-S1…E3-S6 — Done.  

- **Thread ID:** `398ec109-2932-4dca-bc85-e91718a50272`  
- **Статус треда:** closed (2026-03-15)  
- Backend E3-S1…E3-S6 Done. Architect (on_demand) | QA (queued)

---

## Цель

Реализовать JWT-based auth с user tokens (Dashboard) и project tokens (интеграции), Admin API для токенов, rotation/revocation, audit.

---

## Распределение

| Область      | Стек                    | Агент в Cursor          | В message bus               |
| ------------ | ----------------------- | ----------------------- | --------------------------- |
| **Backend**  | apps/api, packages/db   | nest-engineer (или dev) | payload.area: backend       |
| **Frontend** | apps/web (auth flow)    | react-next-engineer     | по запросу после E3-S2+     |


---

## Порядок работ (зависимости)

| Шаг | Story | Описание                              | Область  | Агент               | Статус      |
| --- | ----- | ------------------------------------- | -------- | ------------------- | ----------- |
| 1   | E3-S1 | JWT guard в Nest.js                   | Backend  | nest-engineer / Dev | ✅ Done     |
| 2   | E3-S2 | User tokens (для Dashboard)           | Backend  | nest-engineer / Dev | ✅ Done     |
| 3   | E3-S3 | Project tokens (для интеграций)        | Backend  | nest-engineer / Dev | ✅ Done     |
| 4   | E3-S4 | Admin API для управления токенами     | Backend  | nest-engineer / Dev | ✅ Done     |
| 5   | E3-S5 | Token rotation и revocation            | Backend  | nest-engineer / Dev | ✅ Done     |
| 6   | E3-S6 | Audit логирование                     | Backend  | nest-engineer / Dev | ✅ Done     |
| —   | (E3)  | Login/auth UI в Dashboard (по запросу)  | Frontend | react-next-engineer  | 📋 По запросу |


---

## Контекст

- **Backlog:** [backlog](../product/backlog.md) — Epic 3, E3-S1…E3-S6  
- **ADR:** ADR-010 (users table) при необходимости; JWT claims, RBAC.  
- **Стек:** apps/api (Nest.js), packages/db (Prisma).

---

## Разданные задачи

| Область      | Агент               | Задача                    | Story | Статус    |
| ------------ | ------------------- | ------------------------- | ----- | --------- |
| **Backend**  | nest-engineer / Dev | JWT guard в Nest.js           | E3-S1 | ✅ Done   |
| **Backend**  | nest-engineer / Dev | User tokens (Dashboard)       | E3-S2 | ✅ Done   |
| **Backend**  | nest-engineer / Dev | Project tokens (интеграции)  | E3-S3 | ✅ Done   |
| **Backend**  | nest-engineer / Dev | Admin API для токенов        | E3-S4 | ✅ Done   |
| **Backend**  | nest-engineer / Dev | Token rotation и revocation  | E3-S5 | ✅ Done   |
| **Backend**  | nest-engineer / Dev | Audit логирование            | E3-S6 | ✅ Done   |
| **Frontend** | react-next-engineer  | Auth UI (по запросу)      | —     | По запросу |
| —            | Architect           | JWT/claims, ADR-010, RBAC | —     | On demand |
| —            | QA                  | Проверки после stories   | —     | Queued    |


---

## Отслеживание

- Завершение story → обновить [backlog](../product/backlog.md) и эту таблицу.  
- Блокеры → эскалировать пользователю / Architect.  
- **MCP:** тред `398ec109-2932-4dca-bc85-e91718a50272`. nest-engineer `d0e135a6-c9e0-49c1-8bac-cbe770c154f8`, Architect `d6703179-…`, QA `aa052ead-…`.
