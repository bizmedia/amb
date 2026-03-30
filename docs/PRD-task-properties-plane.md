# PRD: Расширенные свойства задач (Plane-like)

**Версия:** 1.0  
**Дата:** 2026-03-30  
**Статус:** Draft  
**Автор:** Product Owner Agent  
**Связанные документы:** [PRD: модуль задач](./PRD-tasks-module.md) · [PRD: Issue Keys, Epics и Sprints](./PRD-issue-keys-epics-sprints.md) · [PRD: Releases для задач](./PRD-releases.md)

---

## 1. Product Goal

Привести карточку и список задач к более полной Plane-like модели свойств, чтобы задача была не только CRUD-объектом со `state` и `priority`, но полноценной единицей планирования и исполнения.

Целевой набор свойств задачи:

- `status`
- `assignees`
- `priority`
- `createdAt`
- `startDate`
- `dueDate`
- `estimate`
- `module`
- `sprint`
- `labels`

Цель: повысить удобство планирования, фильтрации и обзора задач без перехода к кастомным workflow или enterprise-level complexity.

---

## 2. Problem Statement

Текущий tasks-модуль покрывает базовые сценарии, но пока не даёт Plane-like полноты карточки задачи:

- у задачи нет полного набора planning metadata;
- `assignee` описан как одиночное поле, что плохо покрывает совместную работу;
- `modules` и `labels` были вынесены за пределы базового MVP;
- в списках и деталях нет единой модели полей, которую команда ожидает от инструмента уровня Plane.

Из-за этого задача слабо подходит для:

- недельного и спринтового планирования;
- декомпозиции по функциональным областям;
- фильтрации по ownership и тематике;
- оценки объёма и контроля дедлайнов.

---

## 3. Scope

### In Scope

| Функция | Описание |
| --- | --- |
| Status | Предопределённый статус задачи, отображаемый и редактируемый везде |
| Assignees | Несколько назначенных участников проекта на одну задачу |
| Priority | Приоритет задачи как отдельное поле сортировки и фильтрации |
| Created | Системное поле даты создания, read-only |
| Start date | Плановая или фактическая дата начала работы по задаче |
| Due date | Дата срока выполнения |
| Estimate | Числовая оценка усилия задачи |
| Module | Отдельная project-scoped сущность для тематической группировки задач |
| Sprint | Назначение задачи в sprint по существующей sprint-модели |
| Labels | Множественные project-scoped метки для классификации задач |
| List / detail / board visibility | Поля доступны в деталях; ключевые поля видны в списке и на карточке |
| Filtering and sorting | Фильтры и сортировки по новым свойствам |

### Out of Scope

- Кастомные workflow states per project
- Иерархия module -> submodule
- Вложенные labels / label groups
- Автоматический расчёт estimate
- Capacity planning по assignee/sprint
- Time tracking, spent time, remaining time
- История изменения каждого поля в отдельном activity log PRD

---

## 4. Product Decisions

| Вопрос | Решение |
| --- | --- |
| Status model | Используются предопределённые статусы из базового PRD задач |
| Assignees | Задача может иметь `0..N` assignees; только участники проекта |
| Created | `createdAt` системное, всегда заполняется, не редактируется |
| Start vs Due | `startDate` и `dueDate` независимы и оба optional |
| Estimate semantics | `estimate` — nullable числовая оценка усилия в points, не duration |
| Module cardinality | У задачи максимум один `module` (`0..1`) |
| Sprint cardinality | У задачи максимум один `sprint` (`0..1`) согласно отдельному PRD |
| Labels cardinality | У задачи `0..N` labels |
| Labels scope | Labels переиспользуются внутри проекта, не tenant-wide |
| Modules lifecycle | Modules создаются, редактируются, архивируются аналогично planning-сущностям проекта |
| Backward compatibility | Новый PRD заменяет решение базового PRD о single-assignee и выводит `modules/labels` из Post-MVP в отдельный feature scope |

---

## 5. Functional Requirements

### FR1. Core Task Properties

- Каждая задача в UI/API/SDK возвращает и отображает: `status`, `priority`, `createdAt`, `startDate`, `dueDate`, `estimate`, `module`, `sprint`, `labels`, `assignees`.
- `createdAt` доступен для просмотра в деталях задачи и как колонка списка.
- Все nullable поля могут отсутствовать без нарушения отображения списка/карточки/деталей.

### FR2. Multi-Assignee

- Пользователь может назначить на задачу одного или нескольких участников проекта.
- Один и тот же участник не может быть добавлен в assignees дважды.
- Удалённый из проекта участник перестаёт быть доступным для нового назначения.
- Список задач поддерживает фильтр по одному или нескольким assignees.

### FR3. Dates and Estimate

- Пользователь может установить, изменить и очистить `startDate` и `dueDate`.
- Система допускает задачу только с `startDate`, только с `dueDate`, с обоими полями или без них.
- Пользователь может установить, изменить и очистить `estimate`.
- Список задач поддерживает сортировку и фильтрацию по `createdAt`, `startDate`, `dueDate`, `estimate`.

### FR4. Modules

- Пользователь может создавать, редактировать, архивировать и просматривать modules внутри проекта.
- Module содержит минимум: `name`, `description` (optional), `status`, `createdAt`.
- Статусы module: `PLANNING`, `ACTIVE`, `ARCHIVED`.
- Задача может быть назначена максимум в один module.
- Список задач поддерживает фильтр по module.
- В навигации tasks-модуля доступен раздел `Modules`.

### FR5. Sprint Property

- В рамках этого PRD sprint рассматривается как обязательное поддерживаемое свойство карточки задачи.
- Задача может быть назначена максимум в один sprint по правилам отдельного PRD.
- В списке и деталях задачи sprint отображается как отдельное поле/бейдж.
- Доступен фильтр по sprint наряду с другими свойствами задачи.

### FR6. Labels

- Пользователь может создавать, переименовывать, архивировать и просматривать labels внутри проекта.
- Label содержит минимум: `name`, `color`, `createdAt`, `isArchived`.
- Задача может иметь несколько labels одновременно.
- Список задач поддерживает фильтр по одному или нескольким labels.
- В карточке задачи labels отображаются как компактные badges.

### FR7. Views and Editing

- В `list view` доступны настраиваемые колонки минимум для: `status`, `assignees`, `priority`, `createdAt`, `startDate`, `dueDate`, `estimate`, `module`, `sprint`, `labels`.
- В `board view` обязательно видны минимум: `status`, `priority`, `assignees`, `dueDate`, `module`, `sprint`, `labels`.
- В деталях задачи все свойства доступны в единой правой панели или эквивалентном property block.
- Создание и редактирование задачи поддерживает установку всех editable свойств без перехода в отдельные экраны справочников.

### FR8. API and SDK

- API поддерживает чтение и запись всех перечисленных свойств задачи.
- API поддерживает CRUD для `modules` и `labels`.
- API поддерживает фильтрацию issues по `assignee`, `priority`, `createdAt`, `startDate`, `dueDate`, `estimate`, `moduleId`, `sprintId`, `label`.
- SDK типы и схемы отражают multi-assignee, `module`, `labels`, `estimate`, `startDate`.

---

## 6. Acceptance Criteria

### Epic A: Plane-like Property Model

- В задаче доступны поля `status`, `assignees`, `priority`, `createdAt`, `startDate`, `dueDate`, `estimate`, `module`, `sprint`, `labels`.
- Все поля корректно отображаются в задаче без обязательности, кроме системного `createdAt`.
- Пустые значения не ломают UI и API ответы.

### Epic B: Multi-Assignee

- Пользователь может назначить на задачу более одного участника проекта.
- Один участник не может быть дублирован в списке assignees одной задачи.
- Фильтр по assignees корректно возвращает задачи с выбранными исполнителями.

### Epic C: Dates and Estimate

- Пользователь может задать и очистить `startDate`, `dueDate`, `estimate`.
- Список задач умеет сортироваться по `createdAt`, `startDate`, `dueDate`, `estimate`.
- `estimate` отображается как effort estimate, а не как срок/длительность.

### Epic D: Modules

- Пользователь может создать module внутри проекта.
- Пользователь может назначить задачу в module и снять назначение.
- Одна задача не может одновременно принадлежать двум modules.
- Доступен раздел `Modules` и фильтр задач по module.

### Epic E: Labels

- Пользователь может создать label и назначить его на задачу.
- На одну задачу можно назначить несколько labels.
- Фильтр по labels позволяет отобрать задачи по одной или нескольким меткам.

### Epic F: Visibility Across Views

- В списке задач можно показать колонки всех ключевых свойств.
- На карточке board видны как минимум priority, assignees, dueDate и planning badges.
- В деталях задачи пользователь может редактировать все поддерживаемые свойства из одного места.

---

## 7. Dependencies

| Зависимость | Причина |
| --- | --- |
| Existing issues module | Базовая сущность issue уже существует |
| Project members | Нужны для multi-assignee |
| PRD issue keys / sprints | Sprint уже описан как отдельная planning-сущность |
| PostgreSQL + RLS | Новые поля и сущности должны быть project-scoped |
| UI tasks module | Нужны list/detail/board и формы редактирования |
| i18n infrastructure | Названия полей, фильтров и ошибок должны переводиться |

---

## 8. Backlog Proposal

| ID | Story | Приоритет |
| --- | --- | --- |
| PROP-S1 | Расширить issue model: `startDate`, `estimate`, `createdAt` visibility | P0 |
| PROP-S2 | Перевести `assignee` в multi-assignee модель | P0 |
| PROP-S3 | Добавить API/SDK фильтры и сортировки по новым свойствам | P0 |
| PROP-S4 | Добавить сущность `Module` и связь issue -> module | P1 |
| PROP-S5 | Добавить сущность `Label` и связь issue <-> labels | P1 |
| PROP-S6 | Обновить task create/edit form под полный property set | P1 |
| PROP-S7 | Обновить list/board/detail views под Plane-like properties | P1 |
| PROP-S8 | Архивирование modules и labels + запрет назначения в архивные сущности | P2 |

---

## 9. Risks

- Переход с single-assignee на multi-assignee затрагивает API, SDK, UI и фильтры одновременно.
- Без чёткого UX-правила по видимости колонок список задач может стать перегруженным.
- Если `module` и `label` будут выглядеть слишком похоже, пользователи не поймут разницу между тематической группировкой и тегированием.
- Если не зафиксировать единицу `estimate` как points, команда может начать трактовать поле как часы или дни.

---

## 10. Definition of Done

- [ ] PRD утверждён Product + Architect + QA.
- [ ] Зафиксирована миграционная стратегия для multi-assignee.
- [ ] Согласованы контракты API/SDK для `module`, `labels`, `estimate`, `startDate`.
- [ ] Описаны UX-правила видимости свойств в list / board / detail.
- [ ] Project-scoped isolation покрыта тест-кейсами.

---

## 11. Changelog

| Дата | Версия | Изменения |
| --- | --- | --- |
| 2026-03-30 | 1.0 | Первый релиз отдельного PRD для Plane-like свойств задач |
