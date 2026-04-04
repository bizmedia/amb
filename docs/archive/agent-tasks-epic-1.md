# Задачи агентов: Epic 1 — Архитектурная миграция

**Обновлено:** 2026-03-15 (Orchestrator)  
**Тред:** [feature-workflow-epic-1.md](./feature-workflow-epic-1.md)  

**Message Bus:** задачи разосланы через MCP. Тред: `1c0afd9c-cdad-4f50-bcd6-080232702c3e`. Статус сообщений — в inbox каждого агента (pending → ack по прочтении).

Исходный код для миграции: **`apps/web/lib/`**, **`apps/web/prisma/`**. Корень монорепо: репозиторий `amb-app`, приложение — `apps/web` (package name `mcp-message-bus`).

---

## Dev Agent

### ✅ E1-S3 — packages/shared (завершено)

**Статус:** ✅ Done  
**Итог:** пакет создан, типы/ошибки/схемы/константы перенесены, apps/web подключён, реэкспорты сохранены, правило no-import-extensions добавлено.

---

### ✅ E1-S1 — packages/core (завершено)

**Статус:** ✅ Done  
**Итог:** интерфейс MessageBusStorage, InMemoryMessageBusStorage, сервисы agents/threads/messages, unit-тесты (vitest).

---

### ✅ E1-S2 — packages/db (завершено)

**Статус:** ✅ Done  
**Итог:** Prisma schema и миграции в packages/db, экспорт клиента и IssueState/IssuePriority, RLS-заглушки, prisma.config.mjs, apps/web на @amb-app/db.

---

### ✅ E1-S4 — packages/sdk (завершено)

**Статус:** ✅ Done  
**Итог:** packages/sdk с типами из shared, createClient({ baseUrl, token? }), apps/web реэкспорт.

---

### ✅ E1-S5 — apps/api (Nest.js) (завершено)

**Статус:** ✅ Done  
**Итог:** Каркас Nest.js, все модули, integration-тесты (Jest/supertest, 14 e2e). Порт 3334.

### ✅ E1-S6 — Миграция apps/web на HTTP-клиент (завершено)

**Статус:** ✅ Done  
**Итог:** SDK дополнен (projects, issues, deleteThread). В apps/web: getApiClient(), все API-роуты и stream переведены на вызовы apps/api. resolveProjectId/resolveProjectIdParam через listProjects. Prisma остаётся для скриптов.

**Очередь (Epic 1 завершён)**

| Story   | Задача | Зависимость   |
|--------|--------|----------------|
| E1-S1  | Выделить `packages/core`: доменная логика из `lib/services/` (agents, threads, messages), интерфейс хранилища, in-memory для тестов, unit-тесты | shared готов |
| E1-S2  | Выделить `packages/db`: Prisma schema/migrations из `apps/web/prisma/`, экспорт client, RLS helpers (заглушки) | shared готов |
| E1-S4  | Выделить `packages/sdk`: перенести `lib/sdk/`, перевести на `packages/shared`, `createClient({ baseUrl, token })` | shared готов |
| E1-S5  | Создать `apps/api` (Nest.js), endpoints 1:1 с текущим API | core, db, shared |
| E1-S6  | Миграция всех endpoints в `apps/api`, project scoping, integration-тесты | E1-S5 |

---

## Architect Agent

### Задачи (по запросу / блокерам)

| Задача | Когда |
|--------|--------|
| Уточнить интерфейс хранилища (storage) для core | Перед/во время E1-S1 |
| Уточнить контракт RLS helpers в packages/db | Перед/во время E1-S2 |
| ADR-012 (Workers), ADR-013 (Scaling) | В inbox; не блокирует Epic 1 |

Пока блокеров по Epic 1 нет — при появлении эскалировать в этот документ и в тред.

---

## QA Agent

### Задачи (после реализации)

| Когда | Задача |
|--------|--------|
| После E1-S3 | Проверить: сборка, импорты shared, нет регрессий в apps/web |
| После E1-S1 | Unit-тесты packages/core |
| После E1-S2 | Миграции db, работа Prisma client |
| После E1-S6 | Integration-тесты API, project scoping |

---

## Отслеживание

- **Завершил задачу** → обновить статус в [backlog](../product/backlog.md) (колонка Story), в [feature-workflow-epic-1.md](./feature-workflow-epic-1.md) (таблица), здесь — пометить задачу выполненной и снять assigned.
- **Блокер** → записать в [feature-workflow-epic-1.md](./feature-workflow-epic-1.md) раздел «Блокеры» и при необходимости назначить Architect / эскалировать пользователю.
