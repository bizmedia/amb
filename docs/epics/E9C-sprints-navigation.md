# Epic E9C: Sprints & Navigation

**PRD:** [docs/PRD-issue-keys-epics-sprints.md](../PRD-issue-keys-epics-sprints.md)  
**Stories:** E9-S5, E9-S6  
**Приоритет:** P1  
**Статус:** ✅ Done  
**Sprint:** 7-8  
**Зависит от:** E9A (issue keys), E9B (epics — для навигации)

---

## Goal

Пользователь может планировать задачи по временным итерациям (спринтам). В tasks-модуле доступны разделы All Issues, Epics, Sprints с фильтрацией.

---

## Scope

| FR  | Описание |
|-----|----------|
| FR4 | Sprint Management — CRUD спринтов, lifecycle PLANNED→ACTIVE→COMPLETED |
| FR5 | Views & Navigation — разделы All Issues / Epics / Sprints, фильтрация |
| FR6 | API CRUD для sprints, фильтр по `sprintId` |

---

## Task Breakdown

### Phase 1: DB & Schema

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9C-001 | Создать enum `SprintStatus` | nest-engineer | ✅ Done | `PLANNED`, `ACTIVE`, `COMPLETED` |
| E9C-002 | Создать модель `Sprint` | nest-engineer | ✅ Done | `id`, `projectId`, `name`, `goal?`, `startDate?`, `endDate?`, `status` (default `PLANNED`), `createdAt`, `updatedAt` |
| E9C-003 | Добавить `sprintId` в модель `Issue` | nest-engineer | ✅ Done | `sprintId String?`, relation `Sprint → Issue[]`. `@@index([sprintId])` |
| E9C-004 | Constraint: max 1 ACTIVE sprint per project | nest-engineer | ✅ Done | Partial unique index `Sprint_projectId_active_unique WHERE status=ACTIVE` + app-level validation |
| E9C-005 | Миграция | nest-engineer | ✅ Done | `20260327140000_add_sprints` |
| E9C-006 | RLS политики | nest-engineer | ✅ Done | Sprint project-scoped через `projectId` |

### Phase 2: API

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9C-007 | `POST /api/projects/:projectId/sprints` | nest-engineer | ✅ Done | Создание спринта. Body: `{ name, goal?, startDate?, endDate? }`. Статус по умолчанию `PLANNED` |
| E9C-008 | `GET /api/projects/:projectId/sprints` | nest-engineer | ✅ Done | Список спринтов проекта. Фильтры: `status` |
| E9C-009 | `GET /api/projects/:projectId/sprints/:id` | nest-engineer | ✅ Done | Детали спринта + список/count задач |
| E9C-010 | `PATCH /api/projects/:projectId/sprints/:id` | nest-engineer | ✅ Done | Обновление name, goal, dates, status |
| E9C-011 | `POST /api/projects/:projectId/sprints/:id/start` | nest-engineer | ✅ Done | Перевод в `ACTIVE`. Валидация: нет другого ACTIVE sprint → 409 |
| E9C-012 | `POST /api/projects/:projectId/sprints/:id/complete` | nest-engineer | ✅ Done | Перевод в `COMPLETED` |
| E9C-013 | `DELETE /api/projects/:projectId/sprints/:id` | nest-engineer | ✅ Done | Удаление только PLANNED → 409 для ACTIVE/COMPLETED |
| E9C-014 | `PATCH /api/tasks/:id` — поддержка `sprintId` | nest-engineer | ✅ Done | Назначение/снятие sprint у task. Запрет назначения в COMPLETED → 409 |
| E9C-015 | `GET /api/tasks` — фильтр по `sprintId` | nest-engineer | ✅ Done | Query param `?sprintId=...` |
| E9C-016 | NestJS module | nest-engineer | ✅ Done | `SprintsModule` (controller + service) |
| E9C-017 | E2E тесты | qa | ✅ Done | `app.e2e-spec.ts` describe `sprints (E9C-017)`: CRUD, start/complete, 1×ACTIVE, task sprintId, ?sprintId=, isolation, DELETE PLANNED + SetNull |

### Phase 3: SDK

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9C-018 | Тип `Sprint` | sdk | ✅ Done | `{ id, projectId, name, goal, startDate, endDate, status, createdAt, updatedAt }` |
| E9C-019 | `client.sprints.list()` | sdk | ✅ Done | С фильтрами |
| E9C-020 | `client.sprints.get(id)` | sdk | ✅ Done | |
| E9C-021 | `client.sprints.create(data)` | sdk | ✅ Done | |
| E9C-022 | `client.sprints.update(id, data)` | sdk | ✅ Done | |
| E9C-023 | `client.sprints.start(id)` | sdk | ✅ Done | POST :id/start |
| E9C-024 | `client.sprints.complete(id)` | sdk | ✅ Done | POST :id/complete |
| E9C-025 | `client.sprints.delete(id)` | sdk | ✅ Done | |
| E9C-026 | Обновить тип `Task` | sdk | ✅ Done | Добавить `sprintId?: string`, `sprint?: { id, name, status }` |
| E9C-027 | Обновить фильтры `client.tasks.list()` | sdk | ✅ Done | `{ sprintId? }` |

### Phase 4: Frontend

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9C-028 | Навигация tasks-модуля | react-next-engineer | ✅ Done | Расширить pill-табы: All Issues \| Epics \| Sprints |
| E9C-029 | Список спринтов `/tasks/sprints` | react-next-engineer | ✅ Done | name, dates, status badge, count issues; активный выделен |
| E9C-030 | Экран спринта `/tasks/sprints/:id` | react-next-engineer | ✅ Done | Detail + кнопки Start / Complete (confirm dialog) |
| E9C-031 | Создание/редактирование спринта | react-next-engineer | ✅ Done | Dialog: name, goal, startDate, endDate |
| E9C-032 | Назначение sprint в task | react-next-engineer | ✅ Done | SprintPicker (shadcn Command+Popover, COMPLETED не показывать, optimistic update) |
| E9C-033 | Sprint badge в task list/board | react-next-engineer | ✅ Done | IterationCcw icon + name, аналогично EpicBadge |
| E9C-034 | Фильтр по sprint в task list | react-next-engineer | ✅ Done | Dropdown |
| E9C-035 | Board view: sprint filter | react-next-engineer | ✅ Done | Board отображает задачи одного спринта |
| E9C-036 | Epic detail → sprint visibility | react-next-engineer | ✅ Done | В экране эпика: к каким спринтам распределены задачи |
| E9C-037 | i18n ключи | react-next-engineer | ✅ Done | Все новые строки в en/ru/de |

---

## Agent Assignments

| Агент | Задачи | Порядок |
|-------|--------|---------|
| **architect** | Review Sprint lifecycle, concurrency (1 active), navigation structure | Перед Phase 1 |
| **nest-engineer** | Phase 1 + Phase 2 | После E9B Phase 1-2 (или параллельно с E9B если ресурсы позволяют) |
| **sdk** | Phase 3 | После Phase 2 |
| **react-next-engineer** | Phase 4 | После Phase 2 + E9B Phase 4 (навигация зависит от Epics UI) |
| **ux** | Review навигации и sprint board | Перед Phase 4 |
| **qa** | E2E тесты + review acceptance criteria | ✅ E9C-017 Done |

---

## Dependencies

- **E9A** завершён (Issue keys работают)
- **E9B** завершён (Epics существуют — нужны для навигации и Epic→Sprint visibility)
- RLS и project scoping
- i18n infrastructure

---

## Acceptance Criteria

### Sprints
- [ ] Пользователь может создать спринт с названием и датами
- [ ] Пользователь может перевести спринт в `ACTIVE` и `COMPLETED`
- [ ] В одном проекте нельзя иметь более одного `ACTIVE` sprint
- [ ] Пользователь может назначить issue в sprint и убрать её из sprint
- [ ] Нельзя назначить issue в COMPLETED sprint
- [ ] Список и board можно отфильтровать по sprint
- [ ] В интерфейсе видно, какие задачи входят в активный sprint
- [ ] API и SDK поддерживают CRUD и lifecycle для sprints

### Navigation
- [ ] В tasks-модуле доступны разделы `All Issues`, `Epics`, `Sprints`
- [ ] Каждый раздел отображает релевантный контент с фильтрами
- [ ] Фильтрация по epic и sprint работает корректно
- [ ] Board view поддерживает sprint-фильтрацию

---

## Status Tracking

| Задача | Статус | Агент | Дата |
|--------|--------|-------|------|
| E9C-001–006 DB & Schema | ✅ Done | nest-engineer | 2026-03-26 |
| E9C-007–016 API | ✅ Done | nest-engineer | 2026-03-26 |
| E9C-017 E2E тесты | ✅ Done | qa | 2026-03-26 |
| E9C-018–027 SDK | ✅ Done | sdk | 2026-03-26 |
| E9C-028–037 Frontend | ✅ Done | react-next-engineer | 2026-03-26 |
