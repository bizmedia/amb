# PRD: Sprint Analytics

**Версия:** 1.0  
**Дата:** 2026-03-29  
**Статус:** Draft  
**Автор:** Product Owner Agent

---

## 1. Product Goal

Добавить аналитику спринтов, чтобы команда видела предсказуемость выполнения и динамику прогресса в течение спринта.

Цель: сделать sprint execution прозрачным через визуализации уровня Linear/Plane.

---

## 2. Problem Statement

Сейчас спринты показывают состав задач, но не дают аналитической картины:

- нет burn-down/burn-up динамики;
- не видно scope change во времени;
- сложно оценить фактический throughput и риск carry-over.

---

## 3. Scope

### In Scope (MVP)

| Функция | Описание |
| --- | --- |
| Burndown | Remaining issues по дням спринта |
| Burnup | Done issues vs Total scope по дням |
| Scope Change | Изменение общего scope спринта (added/removed) |
| Throughput | Закрытые задачи за день/неделю в рамках спринта |
| UI charts | Визуализация через стандартные компоненты `shadcn/ui` (area chart где применимо) |
| API analytics | Отдельные endpoints/поля для данных графиков |
| Filters | `project`, `sprint`, optional `assignee`, `priority` |

### Out of Scope

- Velocity по story points;
- прогнозирование даты завершения;
- сравнение между командами/проектами;
- ML-прогнозы.

---

## 4. Product Decisions

| Вопрос | Решение |
| --- | --- |
| Единица работы в MVP | Количество задач (issues), без story points |
| Окно агрегации | День (default), неделя (optional) |
| Источник Done | Состояние issue `Done` |
| Пересчёт scope | Любое добавление/удаление issue в sprint учитывается в timeline |
| Технология графиков | `shadcn/ui` charts, area chart для time-series |

---

## 5. Functional Requirements

### FR1. Burndown

- Система рассчитывает remaining issues на каждый день диапазона спринта.
- На графике видны минимум: фактическая линия и baseline от стартового scope.

### FR2. Burnup

- Система рассчитывает две серии: `doneIssues` и `totalScope`.
- Корректно отражаются изменения scope в процессе спринта.

### FR3. Scope Change

- Система считает ежедневный net-change и cumulative scope.
- Добавления и удаления задач отображаются в аналитике.

### FR4. Throughput

- Система считает количество задач, закрытых за период.
- Поддерживаются daily и weekly агрегации.

### FR5. UI and API

- На странице спринта есть блок `Analytics`.
- Графики реализованы стандартными chart-компонентами (`shadcn/ui`).
- API отдаёт подготовленные серии данных с timestamp и значениями.

### FR6. Access and Isolation

- Аналитика доступна только участникам проекта.
- Данные строго project-scoped/tenant-scoped.

---

## 6. Acceptance Criteria

### Epic A: Sprint Burndown/Burnup

- На странице спринта отображаются `Burndown` и `Burnup`.
- При изменении состава спринта графики обновляются корректно.

### Epic B: Scope and Throughput

- Доступна визуализация `Scope Change`.
- Виден `Throughput` за выбранный период.

### Epic C: API and Filters

- API возвращает time-series для всех 4 метрик.
- Фильтры по `assignee` и `priority` корректно применяются.

### Epic D: Security

- Пользователь не может запросить аналитику чужого проекта/tenant.

---

## 7. Backlog Proposal

| ID | Story | Приоритет |
| --- | --- | --- |
| SA-S1 | Модель расчёта Burndown/Burnup для sprint | P0 |
| SA-S2 | Модель Scope Change + Throughput | P0 |
| SA-S3 | API контракт для sprint analytics | P0 |
| SA-S4 | UI графики (`shadcn/ui` charts) на странице sprint | P1 |
| SA-S5 | Фильтры и агрегации (day/week) | P1 |

---

## 8. Changelog

| Дата | Версия | Изменения |
| --- | --- | --- |
| 2026-03-29 | 1.0 | Первый релиз PRD для Sprint Analytics |

