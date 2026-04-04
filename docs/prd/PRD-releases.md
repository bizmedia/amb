# PRD: Releases для задач

**Версия:** 1.1  
**Дата:** 2026-03-29  
**Статус:** Draft  
**Автор:** Product Owner Agent

---

## 1. Product Goal

Добавить в tasks-модуль сущность `Release`, чтобы команды могли:

- планировать поставки по версиям/датам;
- группировать задачи в конкретный релиз;
- видеть готовность релиза до публикации;
- отделить релизное планирование от sprint-планирования.

Цель: закрыть сценарий release planning в стиле Jira/Linear/Plane в рамках project-scoped vNext.

Уточнение от 2026-03-29: детальная release analytics вынесена в отдельный PRD: [PRD-release-analytics.md](./PRD-release-analytics.md).

---

## 2. Problem Statement

Сейчас задачи можно планировать через issue keys, эпики и спринты, но нет отдельной сущности релиза. Из-за этого:

- сложно отвечать на вопрос "что входит в ближайший релиз";
- нет прозрачной готовности релиза по задачам;
- релизные обсуждения смешиваются со спринтовым планированием;
- отсутствует единый объект для фильтрации и отчётности по поставке.

---

## 3. Scope

### In Scope (MVP)

| Функция | Описание |
| --- | --- |
| Release entity | Отдельная сущность релиза внутри проекта |
| Release fields | `name`, `description` (optional), `targetDate`, `releasedAt` (optional), `status` |
| Release statuses | `PLANNED`, `IN_PROGRESS`, `RELEASED`, `ARCHIVED` |
| Issue -> Release link | Одна задача может быть привязана максимум к одному релизу |
| Release CRUD | Создание, редактирование, перевод статуса, архивирование |
| Planning UI | Список релизов, страница релиза, назначение задач в релиз |
| Filtering | Фильтр задач по `releaseId` |
| Progress view | На релизе видны total issues, done issues, progress % |
| Release analytics | Burnup, Scope Change, Throughput и Open vs Done по релизу |
| Isolation | Строгий project/tenant scope через существующую модель доступа |

### Out of Scope

- Автоматическая генерация release notes;
- семантический versioning (`v1.2.3`) с автоинкрементом;
- кросс-проектные/кросс-tenant релизы;
- несколько релизов на одну задачу одновременно;
- dependencies между релизами;
- автоперенос задач в следующий релиз.

---

## 4. Product Decisions

| Вопрос | Решение |
| --- | --- |
| Уровень сущности Release | Project-scoped |
| Обязательность Release для задачи | Нет, задача может быть без релиза |
| Максимум релизов на задачу | Один (`0..1`) |
| Можно ли добавлять задачи в `RELEASED` | Нет, только после перевода обратно в `IN_PROGRESS` |
| Связь со sprint | Независимые сущности; задача может иметь и sprint, и release |
| Метрика готовности релиза | `% done` по задачам в состоянии `Done` |
| Релиз без `targetDate` | Разрешён, но помечается как unscheduled |

---

## 5. Functional Requirements

### FR1. Release Lifecycle

- Пользователь с правом управления проектом может создать release внутри проекта.
- Поля при создании: `name` (required), `description` (optional), `targetDate` (optional), `status` (default `PLANNED`).
- Пользователь может изменить release и перевести его по статусам.
- При переводе в `RELEASED` сохраняется `releasedAt` (текущая дата/время).
- Архивированный release недоступен для новых назначений задач.

### FR2. Issue Linking

- Issue может иметь поле `releaseId` (nullable).
- Issue можно назначить в release и снять назначение.
- Одновременная привязка issue к нескольким releases запрещена.
- Bulk-операция назначения/снятия release для списка issues поддерживается UI/API.

### FR3. Views and Filtering

- В списке задач отображается текущий release (badge/label).
- Доступен фильтр задач по release.
- На странице release отображается список включённых issues.
- На странице release видны счётчики: `totalIssues`, `doneIssues`, `progressPercent`.

### FR4. API and SDK

- API поддерживает CRUD для releases внутри проекта.
- API поддерживает фильтрацию issues по `releaseId`.
- API и SDK возвращают release-данные в issue read/write ответах.
- Контракты схем и типы SDK покрывают новую сущность и связь.

### FR5. Access and Isolation

- Все операции с release ограничены рамками project membership.
- RLS и project scoping исключают чтение/изменение release чужого проекта/tenant.

### FR6. Release Analytics

- Для каждого release доступны метрики: `Burnup`, `Scope Change`, `Throughput`, `Open vs Done`.
- Метрики строятся по временным точкам от создания release до `releasedAt` (или текущей даты для активного релиза).
- В UI графики реализуются через стандартные chart-компоненты (`shadcn/ui`, area chart где применимо).
- Фильтры аналитики минимум: `project`, `release`, `assignee` (optional), `priority` (optional), `state` (optional).
- Данные аналитики доступны в API для использования в Dashboard и отчётах.

---

## 6. Acceptance Criteria

### Epic A: Release Management

- Пользователь может создать release с `name` и опциональной датой.
- Пользователь может редактировать release и менять статус.
- При переводе в `RELEASED` фиксируется `releasedAt`.
- Архивированный релиз отображается как архивный и не доступен для новых назначений.

### Epic B: Issue Assignment

- Пользователь может назначить issue в release и убрать назначение.
- Issue не может одновременно принадлежать двум release.
- Доступна bulk-операция назначения release для выбранных issues.

### Epic C: Planning and Visibility

- В списке/карточке issue отображается release.
- Фильтр по release работает в списке задач.
- Страница release показывает список issues и прогресс (`total`, `done`, `%`).
- Release данные возвращаются API и SDK без нарушения обратной совместимости.

### Epic D: Security and Tenant Boundaries

- Пользователь не может получить доступ к release другого проекта/tenant.
- Все release-запросы проходят project-scoped авторизацию.

### Epic E: Release Analytics

- На странице релиза отображается `Burnup` (done vs total scope).
- Видна динамика `Scope Change` по задачам релиза.
- Виден `Throughput` (closed issues per day/week) в рамках релиза.
- Видна динамика `Open vs Done` в пределах выбранного окна.
- Графики корректно работают при добавлении/удалении задач из релиза во время планирования.

---

## 7. Dependencies

| Зависимость | Причина |
| --- | --- |
| Existing issues module | Нужна связь issue -> release |
| Issue states | Метрика готовности опирается на `Done` |
| Project members and auth | Контроль прав на CRUD релизов |
| PostgreSQL + RLS | Изоляция данных tenant/project |
| UI tasks module | Визуализация, фильтрация, bulk-операции |

---

## 8. Backlog Proposal

| ID | Story | Приоритет |
| --- | --- | --- |
| REL-S1 | Добавить сущность release и статусы в API/DB/SDK | P0 |
| REL-S2 | Добавить поле `issue.releaseId` и валидацию `0..1` | P0 |
| REL-S3 | Реализовать release CRUD + lifecycle (`PLANNED -> IN_PROGRESS -> RELEASED`) | P0 |
| REL-S4 | Добавить UI: список релизов и страницу релиза с прогрессом | P1 |
| REL-S5 | Добавить фильтр issues по release и отображение badge | P1 |
| REL-S6 | Реализовать bulk assign/unassign issues to release | P1 |
| REL-S7 | Добавить release analytics (burnup/scope/throughput/open-vs-done) | P1 |
| REL-S8 | Добавить архивирование и запрет назначения в archived/released релиз | P2 |

---

## 9. Risks

- Если правила переходов статусов не зафиксировать, команды будут по-разному трактовать "готов к релизу".
- Без bulk-операций релизное планирование будет слишком трудозатратным на больших бэклогах.
- Нужна аккуратная UX-связь release и sprint, чтобы избежать путаницы в планировании.
- Метрика `% done` может искажаться, если workflow state `Done` используется непоследовательно.

---

## 10. Definition of Done

- [ ] PRD утверждён Product + Architect + QA.
- [ ] Контракты API/SDK для release зафиксированы.
- [ ] Определены миграции и правила обратной совместимости.
- [ ] UI сценарии релизного планирования описаны и согласованы.
- [ ] RLS/isolation требования покрыты тест-кейсами.

---

## 11. Changelog

| Дата | Версия | Изменения |
| --- | --- | --- |
| 2026-03-29 | 1.1 | Добавлены обязательные release analytics и критерии приёмки |
| 2026-03-29 | 1.0 | Первый релиз PRD для сущности Release |
