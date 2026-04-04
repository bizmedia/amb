# PRD: Release Analytics

**Версия:** 1.0  
**Дата:** 2026-03-29  
**Статус:** Draft  
**Автор:** Product Owner Agent

---

## 1. Product Goal

Добавить аналитику релизов, чтобы команда и PM видели готовность поставки, изменение scope и темп закрытия задач.

Цель: повысить предсказуемость и управляемость релиза до статуса `RELEASED`.

---

## 2. Problem Statement

Без аналитики релиза сложно:

- понимать, успевает ли команда к target date;
- отслеживать влияние scope change на дату поставки;
- оценивать стабильность прогресса по релизу.

---

## 3. Scope

### In Scope (MVP)

| Функция | Описание |
| --- | --- |
| Burnup | Done issues vs Total scope по релизу |
| Scope Change | Изменение scope релиза во времени |
| Throughput | Closed issues per day/week внутри релиза |
| Open vs Done | Динамика открытых и закрытых задач |
| UI charts | Визуализация через `shadcn/ui` charts (area chart где применимо) |
| API analytics | Данные метрик через API |
| Filters | `project`, `release`, optional `assignee`, `priority`, `state` |

### Out of Scope

- Автоматический прогноз release date;
- дефектная аналитика post-release (defect leakage);
- кросс-релизные портфельные отчёты.

---

## 4. Product Decisions

| Вопрос | Решение |
| --- | --- |
| База расчёта | Количество issues |
| Окно агрегации | Day (default), week (optional) |
| Граница периода | От создания релиза до `releasedAt`, либо до текущей даты |
| Источник Done | Состояние issue `Done` |
| Технология графиков | `shadcn/ui` charts, area chart для time-series |

---

## 5. Functional Requirements

### FR1. Burnup

- Система строит две серии: `doneIssues`, `totalScope`.
- Burnup учитывает изменение состава релиза во времени.

### FR2. Scope Change

- Система отображает net-change и cumulative scope по датам.
- Изменения фиксируются при добавлении/удалении issue из релиза.

### FR3. Throughput

- Система считает число закрытых задач за период.
- Поддерживаются daily/weekly агрегации.

### FR4. Open vs Done

- Система показывает time-series открытых и завершённых задач.
- Значения корректны для активных и уже выпущенных релизов.

### FR5. UI and API

- На странице релиза есть блок `Analytics`.
- Графики построены стандартными chart-компонентами (`shadcn/ui`).
- API отдаёт series-данные с timestamp и значениями.

### FR6. Access and Isolation

- Аналитика релиза доступна только участникам проекта.
- Запросы строго project-scoped и tenant-scoped.

---

## 6. Acceptance Criteria

### Epic A: Core Charts

- На странице релиза отображается `Burnup`.
- На странице релиза отображается `Scope Change`.
- На странице релиза отображается `Open vs Done`.

### Epic B: Throughput

- Виден `Throughput` релиза с daily/weekly агрегацией.
- Данные корректны при изменении scope релиза.

### Epic C: API and Filters

- API возвращает time-series для всех 4 метрик.
- Фильтры применяются корректно и не нарушают производительность на типичном объёме данных.

### Epic D: Security

- Пользователь не может получить данные аналитики чужого проекта/tenant.

---

## 7. Backlog Proposal

| ID | Story | Приоритет |
| --- | --- | --- |
| RA-S1 | Модель расчёта Burnup + Scope Change для release | P0 |
| RA-S2 | Модель Throughput + Open vs Done | P0 |
| RA-S3 | API контракт для release analytics | P0 |
| RA-S4 | UI графики (`shadcn/ui` charts) на странице release | P1 |
| RA-S5 | Фильтры и агрегации (day/week) | P1 |

---

## 8. Changelog

| Дата | Версия | Изменения |
| --- | --- | --- |
| 2026-03-29 | 1.0 | Первый релиз PRD для Release Analytics |

