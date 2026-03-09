# PRD: Модуль задач (Plane-like)

**Версия:** 1.0  
**Дата:** 2025-03-09  
**Статус:** Draft

---

## 1. Product Vision

В рамках проекта пользователи могут создавать и управлять задачами (issues): отслеживать статус, приоритет, исполнителя и организовывать работу через различные представления (список, канбан).

Референс: [Plane](https://plane.so).

---

## 2. Решения (Approved)

| Вопрос | Решение |
|--------|---------|
| Assignee | Только участники проекта |
| States | Только предопределённые (не кастомные per project) |
| Permissions | Project-level достаточно: доступ к проекту = полный доступ к задачам (CRUD) |

---

## 3. Scope

### MVP (в scope)

| Функция | Описание |
|---------|----------|
| Issues (CRUD) | Создание, просмотр, редактирование, удаление задач |
| Title, description | Обязательный title, опциональный description |
| States | Backlog, Todo, In Progress, Done, Cancelled |
| Priorities | None, Low, Medium, High, Urgent |
| Assignees | Только участники проекта |
| Due date | Опциональный дедлайн |
| List view | Табличное представление |
| Kanban board | Колонки по state, drag-and-drop |

### Post-MVP (вне scope)

- Labels
- Cycles (спринты)
- Modules (группировки)
- Sub-issues
- Relations (blocked by, duplicates)
- Comments / activity
- Calendar / Gantt views

---

## 4. Зависимости

| Зависимость | Статус |
|-------------|--------|
| Tenant → Projects | vNext |
| Project members | Нужно для assignee |
| PostgreSQL + RLS | vNext |

---

## 5. Epics и Acceptance Criteria

### E1: CRUD задач

- [ ] Создание задачи с title (обязательно), description (опционально)
- [ ] Привязка к project_id
- [ ] Просмотр списка задач проекта
- [ ] Редактирование задачи (PATCH)
- [ ] Удаление задачи (DELETE)
- [ ] Cascade delete при удалении проекта
- [ ] RLS: доступ только участникам проекта

### E2: States и Priorities

- [ ] State: Backlog, Todo, In Progress, Done, Cancelled (предопределённые)
- [ ] Priority: None, Low, Medium, High, Urgent
- [ ] Фильтрация по state и priority
- [ ] Drag-and-drop меняет state (в Kanban)

### E3: Assignees и Due Date

- [ ] Assignee только из project members
- [ ] due_date (nullable)
- [ ] Отображение assignee и due_date в списке/карточках
- [ ] Фильтрация по assignee и due_date

### E4: Views (List + Kanban)

- [ ] List view: таблица с сортировкой и фильтрами
- [ ] Kanban view: колонки = states, карточки = задачи
- [ ] Drag-and-drop между колонками
- [ ] Переключатель List / Kanban, сохранение выбора (localStorage)

### E5: UI в Dashboard

- [ ] Раздел "Tasks" в навигации проекта
- [ ] Маршрут `/projects/:id/tasks`
- [ ] Форма создания задачи (модалка или страница)
- [ ] Форма редактирования задачи
- [ ] Удаление с confirm dialog

---

## 6. API Reference

```
POST   /projects/:projectId/issues
GET    /projects/:projectId/issues?state=&priority=&assignee=&dueFrom=&dueTo=
GET    /projects/:projectId/issues/:id
PATCH  /projects/:projectId/issues/:id
DELETE /projects/:projectId/issues/:id
```

---

## 7. Backlog по спринтам

### Sprint 1: Основа

| ID | Story |
|----|-------|
| S1.1 | Создание задачи (title*, description) |
| S1.2 | Список задач проекта (GET) |
| S1.3 | Редактирование задачи |
| S1.4 | Удаление задачи |

### Sprint 2: States и Priorities

| ID | Story |
|----|-------|
| S2.1 | State задачи (предопределённые) |
| S2.2 | Priority задачи |
| S2.3 | Фильтры по state и priority |
| S2.4 | Drag-and-drop для смены state в Kanban |

### Sprint 3: Assignees и Due Date

| ID | Story |
|----|-------|
| S3.1 | Assignee (из project members) |
| S3.2 | due_date |
| S3.3 | Фильтры по assignee и due_date |

### Sprint 4: Views

| ID | Story |
|----|-------|
| S4.1 | List view (таблица, сортировка, фильтры) |
| S4.2 | Kanban view (колонки по state, drag-and-drop) |
| S4.3 | Переключатель List / Kanban |

### Sprint 5: UI

| ID | Story |
|----|-------|
| S5.1 | Раздел Tasks в проекте |
| S5.2 | Форма создания задачи |
| S5.3 | Форма редактирования задачи |
| S5.4 | Удаление с подтверждением |

---

## 8. Definition of Done

- [ ] Code review пройден
- [ ] API покрыт тестами (по стратегии QA)
- [ ] RLS обеспечивает project-scoped isolation
- [ ] UI адаптивен (desktop, tablet)

---

## 9. Changelog

| Дата | Версия | Изменения |
|------|--------|-----------|
| 2025-03-09 | 1.0 | Первый релиз PRD |
