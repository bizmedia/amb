# Epic E9A: Project Prefix & Task Keys

**PRD:** [docs/PRD-issue-keys-epics-sprints.md](../PRD-issue-keys-epics-sprints.md)  
**Stories:** E9-S1, E9-S2, E9-S3  
**Приоритет:** P0  
**Статус:** ✅ Phase 1–4 Done (E9A)  
**Sprint:** 7-8

---

## Goal

Каждая задача получает человекочитаемый неизменяемый ключ в формате `PPP-0001`, где `PPP` — настраиваемый префикс проекта.

---

## Scope

| FR  | Описание |
|-----|----------|
| FR1 | Project Task Prefix — поле `taskPrefix` у проекта |
| FR2 | Task Key Generation — автоматическая генерация `key` при создании задачи |
| FR5 | Отображение key в list/board/details |
| FR6 | API/SDK возвращают `key`, поддержан поиск по key |

---

## Task Breakdown

### Phase 1: DB & Schema

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9A-001 | Добавить `taskPrefix` в модель `Project` | nest-engineer | ✅ Done | `taskPrefix String?`, `@@unique([tenantId, taskPrefix])` |
| E9A-002 | Добавить `taskSequence` в модель `Project` | nest-engineer | ✅ Done | `taskSequence Int @default(0)` |
| E9A-003 | Добавить `key` в модель `Task` | nest-engineer | ✅ Done | `key String?`, `@@unique([projectId, key])`, index |
| E9A-004 | Миграция: schema changes | nest-engineer | ✅ Done | `20260326160000_add_task_prefix_and_issue_keys` |
| E9A-005 | Миграция: backfill | nest-engineer | ✅ Done | Backfill prefix, keys, taskSequence в той же миграции |
| E9A-006 | RLS политики | nest-engineer | ✅ Done | `20260326220000_fix_task_rls_policies` — пересозданы после rename |

### Phase 2: API

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9A-007 | PATCH `/api/projects/:id` — поддержка `taskPrefix` | nest-engineer | ✅ Done | Валидация, уникальность в tenant |
| E9A-008 | GET `/api/projects/:id` — возвращать `taskPrefix` | nest-engineer | ✅ Done | Включено в ответ |
| E9A-009 | Генерация key при `POST /api/projects/:projectId/tasks` | nest-engineer | ✅ Done | Атомарный `UPDATE "Project" SET taskSequence = taskSequence + 1 RETURNING` |
| E9A-010 | GET `/api/projects/:projectId/tasks` — возвращать `key` | nest-engineer | ✅ Done | key в каждом task |
| E9A-011 | Фильтр по `key` / `search` | nest-engineer | ✅ Done | `?key=AMB-0012` (exact), `?search=AMB-001` (prefix) |
| E9A-012 | GET `/api/projects/:projectId/tasks/:idOrKey` — поиск по key | nest-engineer | ✅ Done | UUID или human-readable key |
| E9A-013 | E2E тесты | qa | ✅ Done | Полный E2E suite: prefix validation (400/409), параллельное создание (5+10 задач, 0 дублей), exact/prefix search, lookup по key, backfill coverage |

### Phase 3: SDK

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9A-014 | Обновить типы `Task` | sdk | ✅ Done | `key: string` в `packages/sdk/src/types.ts` |
| E9A-015 | Обновить типы `Project` | sdk | ✅ Done | `taskPrefix`, `taskSequence` |
| E9A-016 | Добавить метод поиска по key | sdk | ✅ Done | `client.getTask(projectId, idOrKey)` |
| E9A-017 | Обновить фильтры list tasks | sdk | ✅ Done | `{ key?, search? }` |

### Phase 4: Frontend

| # | Задача | Исполнитель | Статус | Детали |
|---|--------|-------------|--------|--------|
| E9A-018 | Project settings: поле `taskPrefix` | react-next-engineer | ✅ Done | Manage projects: mono input, `^[A-Z]{2,5}$`, preview, debounced проверка уникальности через `GET /api/projects`, предупреждение при смене prefix |
| E9A-019 | Task list: колонка/бейдж `key` | react-next-engineer | ✅ Done | Колонка Key в списке и канбане |
| E9A-020 | Task card/detail: отображение key | react-next-engineer | ✅ Done | Kanban: `key · title`; edit/description dialogs: key в заголовке |
| E9A-021 | Поиск по key | react-next-engineer | ✅ Done | Поиск: full key → `?key=`, иначе prefix → `?search=`; чтение `key`/`search` из URL |
| E9A-022 | i18n ключи | react-next-engineer | ✅ Done | `Tasks.taskKey` в en/ru/de |

---

## Agent Assignments

| Агент | Задачи | Порядок |
|-------|--------|---------|
| **architect** | Review schema design, concurrency strategy | ✅ Завершён |
| **nest-engineer** | Phase 1 (DB) + Phase 2 (API) | ✅ Завершён |
| **sdk** | Phase 3 | ✅ Завершён |
| **react-next-engineer** | Phase 4 (Frontend) | ✅ Завершён |
| **qa** | E2E тесты + review acceptance criteria | ✅ Done (E9A-013) |

---

## Dependencies

- Модель `Project` и `Task` в `packages/db/prisma/schema.prisma`
- API endpoints: `apps/api/src/tasks/`, `apps/api/src/projects/`
- RLS infrastructure (работает, миграция `20260326220000`)
- i18n infrastructure (E7, работает)

---

## Acceptance Criteria

- [x] В API можно задать и изменить `taskPrefix` через PATCH
- [x] Валидация: generatePrefix для новых проектов; PATCH проверяет уникальность в tenant
- [x] Prefix уникален в рамках tenant (`@@unique([tenantId, taskPrefix])`)
- [x] При создании задачи автоматически назначается key формата `PPP-0001`
- [x] Атомарный `UPDATE ... RETURNING` исключает дубликаты при параллельном создании
- [x] У существующих задач после миграции заполнен key (backfill)
- [x] В UI key виден в списке задач (колонка) и на канбан-доске
- [x] В UI key виден в detail view задачи (диалог описания и редактирование)
- [x] API и SDK возвращают key для task
- [x] Поддержан поиск/фильтр по key (exact и prefix)

---

## Risks

- Конкурентная генерация номеров: решено через атомарный `UPDATE ... RETURNING`
- Backfill: ключи назначены по `createdAt ASC`
- Смена prefix не затрагивает существующие keys (by design)

---

## Status Tracking

| Задача | Статус | Агент | Дата |
|--------|--------|-------|------|
| E9A-001–006 DB & Schema | ✅ Done | nest-engineer | 2026-03-26 |
| E9A-007–012 API | ✅ Done | nest-engineer | 2026-03-26 |
| E9A-013 E2E тесты | ✅ Done | qa | 2026-03-26 |
| E9A-014–017 SDK | ✅ Done | nest-engineer | 2026-03-26 |
| E9A-018–022 Frontend | ✅ Done | react-next-engineer | 2026-03-26 |
