# Задачи агентов: Epic 1 — Архитектурная миграция

**Обновлено:** 2026-03-15 (Orchestrator)  
**Тред:** [feature-workflow-epic-1.md](./feature-workflow-epic-1.md)  

**Message Bus:** задачи разосланы через MCP. Тред: `1c0afd9c-cdad-4f50-bcd6-080232702c3e`. Статус сообщений — в inbox каждого агента (pending → ack по прочтении).

Исходный код для миграции: **`apps/web/lib/`**, **`apps/web/prisma/`**. Корень монорепо: репозиторий `amb-app`, приложение — `apps/web` (package name `mcp-message-bus`).

---

## Dev Agent

### ✅ Текущая задача (в работе): E1-S3 — packages/shared

**Статус:** 🚧 Assigned  
**Дедлайн:** по завершении обновить [backlog.md](./backlog.md) и [feature-workflow-epic-1.md](./feature-workflow-epic-1.md).

**Сделать:**
1. Создать `packages/shared/` (структура из [sprint-1-2-action-plan.md](./sprint-1-2-action-plan.md)).
2. Перенести из `apps/web/lib/`:
   - `lib/types.ts` → `packages/shared/src/types.ts`
   - Ошибки: `lib/api/errors.ts`, `lib/services/errors.ts` → `packages/shared/src/errors.ts`
3. Создать `packages/shared/src/schemas/` и вынести Zod-схемы валидации из API routes (`apps/web/app/api/**/route.ts`).
4. Создать `packages/shared/src/constants.ts` (константы).
5. Настроить `package.json` и `tsconfig.json` в `packages/shared`, добавить пакет в `pnpm-workspace.yaml` при необходимости.
6. Убедиться: сборка и импорты из shared работают (обратная совместимость: пока можно оставить реэкспорты в `apps/web/lib/` или переключить импорты на `@amb-app/shared` по решению).

**AC:** общие типы/ошибки/схемы (Zod)/константы в shared; пакет используется без зависимостей от core/db.

---

### Очередь (после E1-S3)

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

- **Завершил задачу** → обновить статус в [backlog.md](./backlog.md) (колонка Story), в [feature-workflow-epic-1.md](./feature-workflow-epic-1.md) (таблица), здесь — пометить задачу выполненной и снять assigned.
- **Блокер** → записать в [feature-workflow-epic-1.md](./feature-workflow-epic-1.md) раздел «Блокеры» и при необходимости назначить Architect / эскалировать пользователю.
