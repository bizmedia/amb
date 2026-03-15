# Feature Workflow: Epic 1 — Архитектурная миграция

**Тред:** feature-workflow  
**Открыт:** 2026-03-15  
**Оркестратор:** orchestrator  
**Статус:** ✅ Done  
**Последняя проверка тредов:** 2026-03-15. Тред Epic 1: 11 сообщений; E1-S1…E1-S6 — Done. Epic 1 завершён.  

**Message Bus (MCP):** тред закрыт (Epic 1 завершён).  
- **Thread ID:** `1c0afd9c-cdad-4f50-bcd6-080232702c3e`  
- **Статус треда:** closed

---

## Цель

Выделить переиспользуемые пакеты (shared → core → db → sdk) и подготовить миграцию API в Nest.js (apps/api).

---

## Порядок работ (зависимости)


| Шаг | Story | Package         | Агент | Статус         |
| --- | ----- | --------------- | ----- | -------------- |
| 1   | E1-S3 | packages/shared | Dev   | ✅ Done        |
| 2   | E1-S1 | packages/core   | Dev   | ✅ Done        |
| 3   | E1-S2 | packages/db     | Dev   | ✅ Done        |
| 4   | E1-S4 | packages/sdk    | Dev   | ✅ Done        |
| 5   | E1-S5 | apps/api (Nest) | Dev   | ✅ Done        |
| 6   | E1-S6 | Миграция API    | Dev   | ✅ Done        |


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
| Dev       | packages/db   | E1-S2  | ✅ Done     | после E1-S3 |
| Dev       | packages/sdk  | E1-S4  | ✅ Done     | после E1-S3 |
| Dev       | apps/api      | E1-S5  | ✅ Done     | после E1-S2 |
| **Dev**   | Миграция API  | E1-S6  | ✅ Done     | после E1-S5 |
| Architect | Интерфейсы (storage, RLS) | — | 📋 On demand | при блокерах |
| QA        | Проверки после каждой story | — | 📋 После Dev | см. agent-tasks |

**Раздаточный документ:** [docs/agent-tasks-epic-1.md](./agent-tasks-epic-1.md) — конкретные формулировки для каждого агента.

---

## E1-S5 завершён (по треду 2026-03-15)

**Сделано:** каркас Nest.js, модули 1:1, ESM/CJS, @repo/typescript-config, @repo/eslint-config, turbo typecheck; apps/api (3334) и apps/web (3333). Добавлены integration-тесты: Jest + supertest, 14 e2e-тестов (projects, agents, threads, messages, inbox/ack, issues, dlq) — все проходят.

## E1-S6 завершён (2026-03-15)

**Сделано:** SDK дополнен (listProjects, createProject, listIssues, createIssue, getIssue, updateIssue, deleteIssue, deleteThread). В apps/web: lib/api/client.ts (getApiClient с API_URL, по умолчанию http://localhost:3334), handleApiError обрабатывает MessageBusError. Все API-роуты и stream переведены на HTTP-клиент; resolveProjectId и resolveProjectIdParam используют listProjects через API. Prisma/lib/services остаются для скриптов (retry-worker, cleanup и т.д.).

---

## Диспетчеризация

**Сейчас:** E1-S5 и E1-S6 завершены. apps/web использует HTTP-клиент (getApiClient, @amb-app/sdk) к apps/api; все роуты и stream переведены.

**Next actions:** QA: проверка после E1-S5/S6.

---

## Отслеживание

- Завершение story → обновить статус в [backlog.md](./backlog.md), в таблице выше и в [agent-tasks-epic-1.md](./agent-tasks-epic-1.md).
- Блокеры → записать в этот документ, эскалировать пользователю / Architect.

**Отслеживание через MCP message bus:** тред `1c0afd9c-cdad-4f50-bcd6-080232702c3e`. Проверить inbox агента: `get_inbox(agentId)` — Dev `67600e80-f780-4aa6-9948-8eb2a77e4e5a`, Architect `d6703179-7d31-45ca-870a-2f9e39d3da78`, QA `aa052ead-9406-40da-9a00-4ab21ca7d128`. Сообщения в статусе pending/delivered до ack.

