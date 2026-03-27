# Epic E9B: Epics (Issue Grouping)

**PRD:** [docs/PRD-issue-keys-epics-sprints.md](../PRD-issue-keys-epics-sprints.md)  
**Stories:** E9-S4  
**Приоритет:** P1  
**Статус:** ✅ Done  
**Sprint:** 7-8  
**Зависит от:** E9A (issue keys должны быть готовы)

---

## Goal

Пользователь может группировать задачи проекта в эпики — крупные инициативы. Задача принадлежит максимум одному эпику.

---

## Scope

| FR  | Описание |
|-----|----------|
| FR3 | Epic Management — CRUD эпиков, привязка issue ↔ epic |
| FR5 | Отображение epic badge в list/board, экран эпика |
| FR6 | API CRUD для epics, фильтр по `epicId` |

---

## Task Breakdown

### Phase 1: DB & Schema

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9B-001 | Создать модель `Epic` | nest-engineer | ✅ Done | `id`, `projectId`, `title`, `description?`, `status` (enum: `OPEN`, `IN_PROGRESS`, `DONE`, `ARCHIVED`), `createdAt`, `updatedAt`. Relation `Project → Epic[]`. `@@index([projectId])` |
| E9B-002 | Добавить `epicId` в модель `Issue` | nest-engineer | ✅ Done | `epicId String?`, relation `Epic → Issue[]`. `@@index([epicId])` |
| E9B-003 | Создать enum `EpicStatus` | nest-engineer | ✅ Done | `OPEN`, `IN_PROGRESS`, `DONE`, `ARCHIVED` |
| E9B-004 | Миграция | nest-engineer | ✅ Done | `20260327120000_add_epics` |
| E9B-005 | RLS политики | nest-engineer | ✅ Done | Epic project-scoped через `projectId`. RLS USING/WITH CHECK по project context |

### Phase 2: API

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9B-006 | `POST /api/projects/:projectId/epics` | nest-engineer | ✅ Done | Создание эпика. Body: `{ title, description?, status? }` |
| E9B-007 | `GET /api/projects/:projectId/epics` | nest-engineer | ✅ Done | Список эпиков проекта. ARCHIVED скрыт по умолчанию, `?status=` для явного фильтра |
| E9B-008 | `GET /api/projects/:projectId/epics/:id` | nest-engineer | ✅ Done | Детали эпика + `_count.tasks` + список задач |
| E9B-009 | `PATCH /api/projects/:projectId/epics/:id` | nest-engineer | ✅ Done | Обновление title, description, status |
| E9B-010 | `DELETE /api/projects/:projectId/epics/:id` | nest-engineer | ✅ Done | Soft archive (status → ARCHIVED). Issues остаются привязанными |
| E9B-011 | `PATCH /api/tasks/:id` — поддержка `epicId` | nest-engineer | ✅ Done | Валидация: epic принадлежит проекту, запрет назначения на ARCHIVED → 409 Conflict |
| E9B-012 | `GET /api/tasks` — фильтр по `epicId` | nest-engineer | ✅ Done | Query param `?epicId=...` |
| E9B-013 | NestJS module | nest-engineer | ✅ Done | `EpicsModule` (controller + service) |
| E9B-014 | E2E тесты | qa | ✅ Done | `app.e2e-spec.ts`: CRUD epics, PATCH `epicId`, `?epicId=`, ARCHIVED→409, isolation |

### Phase 3: SDK

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9B-015 | Тип `Epic` | sdk | ✅ Done | `{ id, projectId, title, description, status, createdAt, updatedAt }` |
| E9B-016 | `client.epics.list()` | sdk | ✅ Done | С фильтрами |
| E9B-017 | `client.epics.get(id)` | sdk | ✅ Done | |
| E9B-018 | `client.epics.create(data)` | sdk | ✅ Done | |
| E9B-019 | `client.epics.update(id, data)` | sdk | ✅ Done | |
| E9B-020 | `client.epics.delete(id)` | sdk | ✅ Done | |
| E9B-021 | Обновить тип `Issue` | sdk | ✅ Done | Добавить `epicId?: string`, `epic?: Epic` |
| E9B-022 | Обновить фильтры `client.issues.list()` | sdk | ✅ Done | `{ epicId? }` |

### Phase 4: Frontend

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9B-023 | Раздел «Epics» в навигации tasks-модуля | react-next-engineer | ✅ Done | `tasks/layout.tsx`: pill All issues \| Epics (`/tasks`, `/tasks/epics`) |
| E9B-024 | Список эпиков (`/epics`) | react-next-engineer | ✅ Done | `epics-list-module.tsx`: таблица, фильтр status, `GET` с `_count.tasks` |
| E9B-025 | Экран эпика (`/epics/:id`) | react-next-engineer | ✅ Done | `epic-detail-module.tsx`, ссылка «в задачах» `?epicId=` |
| E9B-026 | Создание/редактирование эпика | react-next-engineer | ✅ Done | Dialog create/edit, archive confirm |
| E9B-027 | Назначение epic в task | react-next-engineer | ✅ Done | `EpicPicker` (Popover + Command), список без ARCHIVED; create: POST + PATCH epicId |
| E9B-028 | Epic badge в task list/board | react-next-engineer | ✅ Done | `EpicBadge`: dot hash-palette, outline, ссылка на деталь эпика |
| E9B-029 | Фильтр по epic в task list | react-next-engineer | ✅ Done | select в фильтрах + синк `?epicId=` из URL |
| E9B-030 | i18n ключи | react-next-engineer | ✅ Done | `Tasks.*` навигация/эпик; namespace `Epics.*` en/ru/de |

---

## Agent Assignments

| Агент | Задачи | Порядок |
|-------|--------|---------|
| **architect** | Review Epic entity design | Перед Phase 1 |
| **nest-engineer** | Phase 1 + Phase 2 | Первый (после E9A Phase 1-2) |
| **sdk** | Phase 3 | После Phase 2 |
| **react-next-engineer** | Phase 4 | ✅ Завершён (2026-03-26) |
| **qa** | E2E тесты + review acceptance criteria | ✅ E9B-014 Done |

---

## Dependencies

- **E9A** завершён (Issue уже имеет `key`, Project имеет `taskPrefix`)
- Модели `Project`, `Issue` актуальны
- RLS и project scoping работают
- i18n infrastructure готова

---

## Acceptance Criteria

- [x] Пользователь может создать эпик внутри проекта
- [x] Пользователь может редактировать и архивировать эпик
- [x] Пользователь может назначить task в эпик и снять назначение
- [x] Task не может одновременно принадлежать двум эпикам (модель/API)
- [x] Список задач можно фильтровать по эпику
- [x] У эпика есть отдельное представление со списком его задач
- [x] API и SDK поддерживают CRUD для epics
- [x] Epic badge виден в list/board

---

## Status Tracking

| Задача | Статус | Агент | Дата |
|--------|--------|-------|------|
| E9B-001–005 DB & Schema | ✅ Done | nest-engineer | 2026-03-27 |
| E9B-006–013 API | ✅ Done | nest-engineer | 2026-03-27 |
| E9B-014 E2E тесты | ✅ Done | qa | 2026-03-26 |
| E9B-015–022 SDK | ✅ Done | sdk | 2026-03-26 |
| E9B-023–030 Frontend | ✅ Done | react-next-engineer | 2026-03-26 |
