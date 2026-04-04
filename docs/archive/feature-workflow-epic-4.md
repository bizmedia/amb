# Feature Workflow: Epic 4 — Dashboard как продукт

**Тред:** feature-workflow  
**Открыт:** 2026-03-15  
**Оркестратор:** orchestrator  
**Статус:** ✅ Done  

**Message Bus (MCP):** тред создан; задачи разосланы **Frontend** (react-next-engineer).  

- **Thread ID:** `fb0290b6-57a7-45ea-89c2-7d7af8bae5f8`  
- **Статус треда:** closed  
- Frontend E4-S1…E4-S6 Done. Architect (on_demand) | QA (queued)

---

## Цель

Мигрировать Dashboard на HTTP клиент к apps/api, убрать прямой доступ к БД; реализовать user auth flow и UI для tenant/project/token management.

---

## Распределение


| Область      | Стек                 | Агент в Cursor            | В message bus          |
| ------------ | -------------------- | ------------------------- | ---------------------- |
| **Frontend** | apps/web, Next.js    | react-next-engineer (dev) | payload.area: frontend |
| **Backend**  | apps/api (уже готов) | по запросу                | nest-engineer          |


---

## Порядок работ (зависимости)


| Шаг | Story | Описание                     | Область  | Агент               | Статус         |
| --- | ----- | ---------------------------- | -------- | ------------------- | -------------- |
| 1   | E4-S1 | Next.js Dashboard (apps/web) | Frontend | react-next-engineer | ✅ Done         |
| 2   | E4-S2 | HTTP клиент к apps/api + JWT | Frontend | react-next-engineer | ✅ Done        |
| 3   | E4-S3 | Удалить прямой доступ к БД   | Frontend | react-next-engineer | ✅ Done        |
| 4   | E4-S4 | User authentication flow     | Frontend | react-next-engineer | ✅ Done        |
| 5   | E4-S5 | Tenant/Project management UI | Frontend | react-next-engineer | ✅ Done        |
| 6   | E4-S6 | Token management UI          | Frontend | react-next-engineer | ✅ Done        |


---

## Контекст

- **Backlog:** [backlog](../product/backlog.md) — Epic 4, E4-S1…E4-S6  
- **API:** apps/api (Nest.js) с JWT, login, project tokens, admin API — готов (Epic 3).  
- **Стек:** apps/web (Next.js), HTTP клиент к apps/api.

---

## Разданные задачи


| Область      | Агент               | Задача                           | Story       | Статус         |
| ------------ | ------------------- | -------------------------------- | ----------- | -------------- |
| **Frontend** | react-next-engineer | Next.js Dashboard (apps/web)     | E4-S1       | ✅ Done         |
| **Frontend** | react-next-engineer | HTTP клиент + JWT                | E4-S2       | ✅ Done        |
| **Frontend** | react-next-engineer | Удалить прямой доступ к БД       | E4-S3       | ✅ Done        |
| **Frontend** | react-next-engineer | User authentication flow         | E4-S4       | ✅ Done        |
| **Frontend** | react-next-engineer | Tenant/Project management UI     | E4-S5       | ✅ Done        |
| Frontend     | react-next-engineer | E4-S6 Token management UI       | E4-S6       | ✅ Done        |
| —            | Architect           | По запросу (структура, auth, UI) | —           | On demand      |
| —            | QA                  | Проверки после stories           | —           | Queued         |


---

## Отслеживание

- Завершение story → обновить [backlog](../product/backlog.md) и эту таблицу.  
- Блокеры → эскалировать пользователю / Architect.  
- **MCP:** тред `fb0290b6-57a7-45ea-89c2-7d7af8bae5f8`. react-next-engineer `72c8cb90-7f34-469b-be89-5ab518559c16`, Architect `d6703179-…`, QA `aa052ead-…`.
