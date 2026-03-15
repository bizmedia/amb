# Feature Workflow: Epic 1 — Архитектурная миграция

**Тред:** feature-workflow  
**Открыт:** 2026-03-15  
**Оркестратор:** orchestrator  
**Статус:** 🚧 In Progress  
**Последняя проверка inbox:** 2026-03-15 (1 входящее обработано)  

**Message Bus (MCP):** тред создан, задачи разосланы агентам.  
- **Thread ID:** `1c0afd9c-cdad-4f50-bcd6-080232702c3e`  
- **Сообщения:** Dev (E1-S3) — `efe29a49-…`, Architect (on demand) — `8ad218c7-…`, QA (queued) — `43278928-…`

---

## Цель

Выделить переиспользуемые пакеты (shared → core → db → sdk) и подготовить миграцию API в Nest.js (apps/api).

---

## Порядок работ (зависимости)


| Шаг | Story | Package         | Агент | Статус         |
| --- | ----- | --------------- | ----- | -------------- |
| 1   | E1-S3 | packages/shared | Dev   | ✅ Done        |
| 2   | E1-S1 | packages/core   | Dev   | ✅ Done        |
| 3   | E1-S2 | packages/db     | Dev   | 📋 Planned     |
| 4   | E1-S4 | packages/sdk    | Dev   | 📋 Planned     |
| 5   | E1-S5 | apps/api (Nest) | Dev   | 📋 Planned     |
| 6   | E1-S6 | Миграция API    | Dev   | 📋 Planned     |


---

## Контекст для агентов

- **Детальный план:** [docs/sprint-1-2-action-plan.md](./sprint-1-2-action-plan.md)
- **Backlog:** [docs/backlog.md](./backlog.md) — Epic 1, E1-S1…E1-S6
- **Исходный код:** доменная логика в `apps/web/lib/services/`, Prisma в `apps/web/prisma/`, типы/ошибки в `apps/web/lib/`. После выделения packages — `apps/web` продолжает работать (обратная совместимость).

---

## Разданные задачи

| Агент     | Задача        | Story   | Статус     | Документ |
|-----------|---------------|--------|------------|----------|
| **Dev**   | packages/shared | E1-S3  | ✅ Done     | [agent-tasks-epic-1.md](./agent-tasks-epic-1.md) |
| Dev       | packages/core | E1-S1  | ✅ Done     | после E1-S3 |
| **Dev**   | packages/db   | E1-S2  | 🚧 In Progress | после E1-S3 |
| Dev       | packages/sdk  | E1-S4  | 📋 Queued   | после E1-S3 |
| Dev       | apps/api      | E1-S5  | 📋 Queued   | после E1-S2 |
| Dev       | Миграция API  | E1-S6  | 📋 Queued   | после E1-S5 |
| Architect | Интерфейсы (storage, RLS) | — | 📋 On demand | при блокерах |
| QA        | Проверки после каждой story | — | 📋 После Dev | см. agent-tasks |

**Раздаточный документ:** [docs/agent-tasks-epic-1.md](./agent-tasks-epic-1.md) — конкретные формулировки для каждого агента.

---

## Диспетчеризация

**Сейчас:** Dev — выполнить **E1-S2 (packages/db)** по [agent-tasks-epic-1.md](./agent-tasks-epic-1.md) и [sprint-1-2-action-plan.md](./sprint-1-2-action-plan.md).

**После E1-S3 (done):** Dev — E1-S1 → E1-S2 → E1-S4. Architect — по запросу (интерфейсы, RLS). QA — проверки после завершения stories.

---

## Отслеживание

- Завершение story → обновить статус в [backlog.md](./backlog.md), в таблице выше и в [agent-tasks-epic-1.md](./agent-tasks-epic-1.md).
- Блокеры → записать в этот документ, эскалировать пользователю / Architect.

**Отслеживание через MCP message bus:** тред `1c0afd9c-cdad-4f50-bcd6-080232702c3e`. Проверить inbox агента: `get_inbox(agentId)` — Dev `67600e80-f780-4aa6-9948-8eb2a77e4e5a`, Architect `d6703179-7d31-45ca-870a-2f9e39d3da78`, QA `aa052ead-9406-40da-9a00-4ab21ca7d128`. Сообщения в статусе pending/delivered до ack.

