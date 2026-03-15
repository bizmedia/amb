# Feature Workflow: Epic 6 — Операционная готовность

**Тред:** feature-workflow  
**Открыт:** 2026-03-15  
**Оркестратор:** orchestrator  
**Статус:** 🚧 In Progress  

**Message Bus (MCP):** тред создан; задачи разосланы **Backend** (nest-engineer).  

- **Thread ID:** `4f897ce3-754c-45af-bed3-0efe0c38c3ca`  
- **Статус треда:** open  
- E6-S1 Done; E6-S2 в работе. Architect отчитался (документация E6). QA (queued)

---

## Цель

Подготовить продукт к production deployment: rate limiting, observability, health checks, deployment automation, backup.

---

## Распределение

| Область   | Содержание              | Агент        | В message bus     |
| --------- | ----------------------- | ------------ | ------------------ |
| **Backend** | apps/api (rate limit, health, logging) | nest-engineer | area: backend   |
| DevOps    | deployment, backup      | по запросу   | devops             |
| Architect | по запросу              | architect    | on_demand          |
| QA        | проверки после stories  | qa           | queued             |


---

## Порядок работ

| Шаг | Story | Описание                          | Статус      |
| --- | ----- | --------------------------------- | ----------- |
| 1   | E6-S1 | Rate limiting                     | ✅ Done     |
| 2   | E6-S2 | Observability (логи/метрики)      | 🚧 In Progress |
| 3   | E6-S3 | Tracing                           | 📋 Queued   |
| 4   | E6-S4 | Health checks                     | 📋 Queued   |
| 5   | E6-S5 | Deployment automation             | 📋 Queued   |
| 6   | E6-S6 | Backup и disaster recovery        | 📋 Queued   |


---

## Контекст

- **Backlog:** [docs/backlog.md](./backlog.md) — Epic 6, E6-S1…E6-S6  
- **Стек:** apps/api (Nest.js), инфраструктура.


---

## Разданные задачи

| Агент        | Задача              | Story | Статус   |
| ------------ | ------------------- | ----- | -------- |
| **nest-engineer** | Rate limiting       | E6-S1 | ✅ Done   |
| **nest-engineer** | Observability       | E6-S2 | 🚧 In Progress |
| nest-engineer     | E6-S3…E6-S6        | E6-S3…E6-S6 | Queued |
| Architect         | По запросу      | —     | On demand |
| QA                | Проверки после stories | — | Queued   |


---

## Отслеживание

- Завершение story → обновить [backlog.md](./backlog.md) и эту таблицу.  
- **MCP:** тред `4f897ce3-754c-45af-bed3-0efe0c38c3ca`. nest-engineer `d0e135a6-…`, Architect `d6703179-…`, QA `aa052ead-…`.
