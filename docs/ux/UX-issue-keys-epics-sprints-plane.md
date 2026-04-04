# UX Review: Issue Keys, Epics & Sprints

**PRD:** [docs/prd/PRD-issue-keys-epics-sprints.md](../prd/PRD-issue-keys-epics-sprints.md)  
**Автор:** UX Agent  
**Дата:** 2026-03-26  
**Статус:** Review  
**Обновление:** выравнивание с паттернами [Plane](https://plane.so) (навигация по проекту, Issues / Modules / Cycles, плотность списка)

---

## 0. Выравнивание с Plane

### Соответствие терминов (для i18n и онбординга)

| AMB / PRD | Аналог в Plane | Примечание |
|-----------|----------------|------------|
| Issue key `PPP-0001` | Issue ID в списке | Ключ слева от заголовка, моноширинный, приглушённый |
| Epic | **Module** | Крупная инициатива, список с прогресс-баром и счётчиком задач |
| Sprint | **Cycle** | Карточки с датами, статусом, прогрессом по задачам |
| All Issues | **Issues** (project) | List / Board, верхняя панель фильтров |

В интерфейсе можно оставить слова «Epic» / «Sprint» (как в PRD), но **визуально и по структуре экранов** держаться ближе к Plane: боковая навигация по разделам проекта, спокойная типографика, фильтры в одной строке над контентом, минимальные «пилюли» для модуля/цикла.

### Принципы UI «как в Plane»

- **Иерархия:** проект → раздел (Issues / Epics / Sprints) → контент; не смешивать глобальный дашборд шины с tasks-layout.
- **Плотность:** в списке задач акцент на **ключ + заголовок** в одной ячейке; state/priority — компактные outline-бейджи; справа — assignee (аватар или инициалы), due.
- **Навигация по разделам:** вертикальный **вторичный сайдбар** внутри `/tasks` (как project sidebar в Plane до/параллельно Navigation 2.0): фиксированная ширина `~14–16rem`, сворачиваемый в иконки.
- **Plane Navigation 2.0:** в новых версиях Plane часть фич проекта вынесена в **горизонтальные табы** под шапкой. Для узкой ширины или упрощения MVP допустимо **переключение режима:** desktop — сайдбар; `< md` — те же три пункта в горизонтальных табах под заголовком (без дублирования обоих сразу).
- **Без лишнего брендинга:** нейтральный фон, `border`/`muted` для разделителей, без тяжёлых карточных теней везде — в духе Plane.

---

## 1. Навигация tasks-модуля

### Решение: боковая навигация (Plane-style) + fallback табами

**Основной паттерн (desktop):** слева от контента — **узкий сайдбар** с пунктами:

1. **All Issues** — list / kanban (как сейчас, плюс ключ и фильтры epic/sprint).
2. **Epics** — список эпиков в стиле **Modules** Plane: карточки/строки с прогрессом.
3. **Sprints** — список спринтов в стиле **Cycles** Plane: группировка по статусу, карточки с датами.

**Обоснование:**
- Совпадает с ожиданиями пользователей Jira/Linear/**Plane** при работе «внутри проекта».
- Три пункта не перегружают сайдбар; при сворачивании остаются иконки (LayoutList, Layers, CalendarRange — или аналоги из lucide).
- URL сохраняет глубину: например `/tasks/issues`, `/tasks/epics`, `/tasks/sprints` или `/tasks?section=issues|epics|sprints` — на усмотрение Dev; важна **стабильная ссылка** для шаринга.

**Альтернатива (как Plane Navigation 2.0):** на широком экране вместо сайдбара — **горизонтальные табы** под заголовком проекта (`All Issues | Epics | Sprints`). Выбор: либо сайдбар, либо табы на breakpoint; не показывать оба одновременно, чтобы не дублировать навигацию.

### Wireframe: layout «как Plane» (сайдбар)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ← Dashboard    Tasks · {ProjectName}              [List] [Kanban] [+ …]   │
├─────────────┬──────────────────────────────────────────────────────────────┤
│             │  ┌─ Filters (одна строка, приглушённые контролы) ───────────┐  │
│  Issues     │  │ State ▾  Priority ▾  Epic ▾  Sprint ▾  Assignee ▾  🔍  │  │
│  (active)   │  └────────────────────────────────────────────────────────┘  │
│             │                                                              │
│  Epics  12  │  … таблица / канбан …                                        │
│             │                                                              │
│  Sprints 3  │                                                              │
│             │                                                              │
│  [◀]        │                                                              │
└─────────────┴──────────────────────────────────────────────────────────────┘
```

- Кнопка сворачивания сайдбара `[◀]` внизу или в шапке колонки (как resizable/collapsed sidebar в Plane).
- **List | Kanban** и **+ New Issue** остаются в **верхней панели основной области** только для раздела Issues; в Epics/Sprints первичная кнопка — **+ Epic** / **+ Sprint**.

### Спецификация разделов

| Раздел | Счётчик (опционально) | Содержимое | Пример URL |
|--------|------------------------|------------|------------|
| **All Issues** | Всего issues проекта | List + Kanban, фильтры epic/sprint | `/tasks/issues` |
| **Epics** | Активные эпики (без ARCHIVED) | Список модулей с прогрессом | `/tasks/epics` |
| **Sprints** | PLANNED + ACTIVE | Cycles-список + деталь спринта | `/tasks/sprints` |

### UX-правила навигации

- Активный пункт сайдбара визуально: `bg-accent` + `text-foreground`, остальные `text-muted-foreground`.
- При переходе из бейджа epic/sprint на Issues с предзаполненным фильтром — подсветить активный фильтр в баре (как «применённый фильтр» в Plane).
- Polling обновляет счётчики в сайдбаре без мерцания (мягкое обновление чисел).
- На мобильном: сайдбар в **Sheet** / drawer по кнопке «меню разделов» или горизонтальные табы под заголовком.

### Keyboard Shortcuts

| Shortcut | Действие |
|----------|----------|
| `g` затем `i` | Перейти в All Issues (опционально, если введёте command palette позже) |
| `1` / `2` / `3` | Переключить раздел Issues / Epics / Sprints (если фокус в модуле tasks) |
| `C` | Создать сущность по текущему разделу |
| `/` | Фокус на поиске в filter bar |

---

## 2. Issue Key: отображение (Plane-style)

### В List View

В духе Plane строка задачи читается как **одна сущность «идентификатор + название»**, а не две равнозначные колонки.

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Issue (key + title)              State    Priority   Module   Cycle   👤 Due │
├────────────────────────────────────────────────────────────────────────────┤
│  AMB-0042  Fix auth timeout       In prog  High       Auth     S7      J 28.03│
│  AMB-0041  Add rate limiter       Backlog  —          API      —       —  —   │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Ячейка Issue:** две строки или одна строка с разделителем:
  - ключ: `font-mono text-xs text-muted-foreground tabular-nums`, без жирного;
  - заголовок: `text-sm font-medium text-foreground`, сразу справа от ключа или под ним (`flex flex-col gap-0.5`).
- Клик по ключу или заголовку открывает деталь / редактирование (как в Plane — вся ячейка кликабельна, опционально).
- Справа: компактные бейджи state/priority, затем **module** (epic) и **cycle** (sprint) в виде **лёгких пилюль** (см. §3), assignee как круг 24px или инициалы, due — короткая дата.

### В Kanban Card

```
┌─────────────────────────────────┐
│  AMB-0042 · Fix auth timeout    │  ← одна строка: key muted + title (Plane-like)
│                                 │
│  Auth   ·   Sprint 7            │  ← тонкие пилюли, не «тяжёлые» карточки
│  High     @john      Mar 28     │  ← priority + assignee + due, вторичный ряд
└─────────────────────────────────┘
```

- Первая строка карточки: `key` + разделитель `·` + `title` — быстрый скан, как у плотных board-карточек Plane.
- Описание markdown — по кнопке «развернуть» или второй строкой урезанным, чтобы не конкурировать с ключом.

### В Search

- Search input поддерживает exact match по key: пользователь вводит `AMB-0042` → показывается одна issue
- Placeholder: `Search by key or title...`
- При вводе формата `XXX-NNNN` — prefix-match поиск (api `?search=`)

---

## 3. Epic / Sprint в списке и доске (Modules / Cycles, стиль Plane)

В Plane модули и циклы в списке задач обычно выглядят как **лёгкие метки**, а не крупные «кнопки». Сохраняем различие epic vs sprint, но визуально приближаемся к этому.

### Epic (Module) — пилюля

```
   ┌─────────────┐
   │ ● Auth Flow │   ← маленький цветной круг 6px + текст, outline или ghost
   └─────────────┘
```

- **Стиль:** `rounded-md border border-border/60 bg-transparent px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent/50` (ближе к Plane module chip).
- **Цвет модуля:** точка слева `rounded-full size-1.5` с фоном из той же палитры (`hash(epicId)`), без толстой левой границы карточки — спокойнее, чем в первой версии документа.
- **Интерактивность:** клик → раздел Epics + фильтр по эпику (или открытие сайдбара эпика).
- **Tooltip:** полное название + статус эпика.
- **Пусто:** ячейка пустая или «—» в muted только в compact table-режиме; в основном списке — просто отсутствие пилюли.

### Sprint (Cycle) — пилюля

```
   ┌────────────┐
   │ S7         │   или   │ Sprint 7 │   при достаточной ширине
   └────────────┘
```

- **Стиль:** без иконки-«бегуна» в каждой строке (в Plane циклы часто текстовые); опционально `Calendar` 12px слева только в заголовках раздела Sprints.
- **Фон:** `bg-muted/50` + `text-xs` + без жирной рамки; **active cycle** — лёгкое кольцо `ring-1 ring-primary/25` или точка `text-primary` перед названием.
- **Клик:** переход в деталь спринта.
- **Пусто:** нет пилюли.

### Расположение в List View

- Колонки после state/priority: **Module** | **Cycle** | **Assignee** | **Due** | actions.
- На планшете можно склеить Module+Cycle в одну колонку «Planning» с двумя пилюлями в ряд.

### Расположение в Kanban Card

- Под первой строкой (`key · title`): ряд `flex gap-1.5 flex-wrap` — сначала module chip, затем cycle chip, затем priority (outline badge или точка).
- Нижний ряд: assignee + due — как вторичный `text-xs text-muted-foreground`.

---

## 4. Sprint Lifecycle UI (Cycles, стиль Plane)

Список и карточки спринта держать **в духе Plane Cycles**: нейтральные карточки с чётким заголовком цикла, датами подзаголовком, тонкой полосой прогресса и первичной кнопкой действия справа (Start / End cycle).

### Статусы и визуальное кодирование

| Status | Badge | Цвет | Иконка | Действия |
|--------|-------|------|--------|----------|
| `PLANNED` | `variant="outline"` | `text-muted-foreground` | `CalendarClock` | Edit, Start Sprint, Delete |
| `ACTIVE` | `variant="default"` | `bg-primary` | `Play` | Edit, Complete Sprint |
| `COMPLETED` | `variant="secondary"` | `text-muted-foreground` | `CheckCircle2` | Read-only |

### Sprint List (раздел Sprints)

```
┌──────────────────────────────────────────────────────────────────┐
│  Sprints                                          [+ New Sprint] │
│                                                                  │
│  ═══════════════════════════════════════════════════════          │
│  ▶ ACTIVE                                                        │
│  ═══════════════════════════════════════════════════════          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🏃 Sprint 7                                 [Complete ▶]  │  │
│  │  Goal: Deliver issue keys and epic CRUD                    │  │
│  │  Mar 17 — Mar 28, 2026          12 issues  (4 done, 3 ip) │  │
│  │  ████████████░░░░░░░░  58%                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─ PLANNED ──────────────────────────────────────────────        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  📅 Sprint 8                                  [Start ▶]    │  │
│  │  Goal: Epics frontend + sprint board                       │  │
│  │  Mar 31 — Apr 11, 2026           8 issues  (0 done)       │  │
│  │  ░░░░░░░░░░░░░░░░░░░░  0%                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─ COMPLETED ────────────────────────────────────────────        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ✅ Sprint 6                                (collapsed)    │  │
│  │  Mar 3 — Mar 14, 2026            15 issues (15 done)      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### UX-правила Sprint Lifecycle

1. **Создание:** Sprint создаётся со статусом `PLANNED`. Обязательно: `name`. Опционально: `goal`, `startDate`, `endDate`
2. **Start Sprint:**
   - Кнопка `Start Sprint` видна только для `PLANNED` спринтов
   - Перед стартом — confirmation dialog: «Start Sprint 8? Only one sprint can be active at a time.»
   - Если уже есть ACTIVE sprint — показать warning: «Sprint 7 is currently active. Complete it first or start this sprint to replace it.»
   - **Рекомендация:** НЕ разрешать старт при активном спринте (следовать PRD constraint «max 1 ACTIVE»)
3. **Complete Sprint:**
   - Кнопка `Complete Sprint` видна только для `ACTIVE` спринта
   - Confirmation dialog показывает сводку: «Complete Sprint 7? 3 issues still in progress, 2 in backlog.»
   - Незавершённые задачи остаются в спринте (не перемещаются автоматически — out of scope)
4. **Delete:**
   - Только для `PLANNED` спринтов
   - Confirmation: «Delete Sprint 8? Issues will be unassigned from this sprint.»
   - `ACTIVE` и `COMPLETED` спринты удалять нельзя
5. **Progress bar:** `(DONE issues / total issues) * 100%`. Цвет: green для >80%, yellow 40-80%, muted <40%

### Sprint Detail View

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to Sprints                                               │
│                                                                  │
│  🏃 Sprint 7                        [ACTIVE]  [Complete ▶]      │
│  Goal: Deliver issue keys and epic CRUD                          │
│  Mar 17 — Mar 28, 2026                                           │
│                                                                  │
│  Progress: ████████████░░░░░░░░  7/12 done (58%)                │
│                                                                  │
│  ┌─ Issues ────────────────────────────────────────────────────┐ │
│  │ [State ▾] [Priority ▾] [Assignee ▾]                        │ │
│  │                                                             │ │
│  │ AMB-0042  Fix auth timeout    IN_PROG   ▎Auth    ● High    │ │
│  │ AMB-0041  Add rate limiter    BACKLOG   ▎API     ○ Medium  │ │
│  │ AMB-0040  Update docs         DONE      —        ○ Low     │ │
│  │ ...                                                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Epics View (Modules, стиль Plane)

Список эпиков — по смыслу **Modules** в Plane: вертикальный список строк/карточек с названием, коротким описанием (1 строка), прогресс-баром и подписью «N issues» / «M completed».

### Epic List (раздел Epics)

```
┌──────────────────────────────────────────────────────────────────┐
│  Epics                                             [+ New Epic]  │
│                                                                  │
│  [All ▾]  [Status: All ▾]                                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ▎ Auth Flow                                    [OPEN]     │  │
│  │  Implement authentication and authorization                │  │
│  │  8 issues  (3 done, 2 in progress, 3 backlog)             │  │
│  │  ████████░░░░░░░░░░░░  37%                    Sprint 7, 8 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ▎ API Improvements                         [IN_PROGRESS]  │  │
│  │  Rate limiting, caching, error handling                    │  │
│  │  5 issues  (1 done, 4 backlog)                            │  │
│  │  ██░░░░░░░░░░░░░░░░░░  20%                      Sprint 7 │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Epic Detail View

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to Epics                                                 │
│                                                                  │
│  ▎ Auth Flow                               [OPEN]  [Edit] [⋯]  │
│  Implement authentication and authorization                      │
│                                                                  │
│  Progress: ████████░░░░░░░░░░░░  3/8 done (37%)                │
│                                                                  │
│  Sprint breakdown:                                               │
│    Sprint 7: 5 issues (2 done, 2 ip, 1 backlog)                │
│    Sprint 8: 2 issues (1 done, 1 todo)                          │
│    Unplanned: 1 issue                                            │
│                                                                  │
│  ┌─ Issues ────────────────────────────────────────────────────┐ │
│  │ [State ▾] [Sprint ▾] [Priority ▾]                          │ │
│  │                                                             │ │
│  │ AMB-0042  Fix auth timeout    IN_PROG  Sprint 7   ● High   │ │
│  │ AMB-0041  Add token refresh   BACKLOG  Sprint 8   ○ Medium │ │
│  │ ...                                                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Epic → Sprint Visibility (FR5)

В detail view эпика — секция **«Sprint breakdown»**:
- Группировка задач эпика по спринтам
- Показывает распределение задач и прогресс по каждому спринту
- Задачи без спринта — отдельная группа «Unplanned»

---

## 6. Epic Assignment Flow в карточке Issue

### Решение: Inline Select (Combobox)

При редактировании issue (dialog или будущий inline-edit) — поле **Epic** реализуется как `Combobox` (shadcn Command + Popover pattern).

### Wireframe: Issue Form (расширение)

```
┌─ Edit Issue ─────────────────────────────────────────────────────┐
│                                                                  │
│  Title:    [Fix authentication timeout              ]            │
│                                                                  │
│  Description:                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Markdown editor...                                      │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ State:    [IN_PROG▾]│  │ Priority: [HIGH ▾]  │               │
│  └─────────────────────┘  └─────────────────────┘               │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ Assignee: [john  ▾] │  │ Due date: [Mar 28]  │               │
│  └─────────────────────┘  └─────────────────────┘               │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ Epic:  [Auth Flow▾] │  │ Sprint: [Sprint 7▾] │    ← NEW     │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│                                   [Cancel]  [Save]               │
└──────────────────────────────────────────────────────────────────┘
```

### UX-правила назначения Epic

1. **Combobox с поиском:** dropdown с текстовым фильтром — для проектов с большим количеством эпиков
2. **Элемент списка (Plane-like):** цветная точка + `<Epic Title>` + `(<status>)` в muted — без толстой вертикальной полосы
3. **Опция «None»:** первый пункт — `— No epic —` для снятия назначения
4. **Только из того же проекта:** список загружается через `GET /api/epics` с projectId из контекста
5. **Optimistic update:** при выборе эпика badge сразу появляется, затем подтверждается API
6. **Archived epics:** не показываются в списке для назначения, но если issue уже привязана к archived epic — показывать `(archived)` badge

### UX-правила назначения Sprint

1. Аналогичный Combobox
2. **Показывать только `PLANNED` и `ACTIVE`** спринты — нельзя назначить в `COMPLETED`
3. **Active sprint** — выделен в списке (bold или accent)
4. **Опция «None»:** `— No sprint —`

---

## 7. Project Settings: поле taskPrefix

### Расположение

Новую секцию **«Task Settings»** добавить в Project Switcher → Manage Projects → выбранный проект, ИЛИ — если будет отдельная страница `/settings` — туда.

Пока отдельной страницы Settings нет, рекомендую добавить как часть **Project rename dialog** (расширить его до «Project Settings modal»).

В духе Plane настройки проекта читаются как **одна спокойная форма** без лишних вложенных карточек: поле префикса — на одном уровне с именем проекта, с короткой подписью-превью.

### Wireframe: Project Settings

```
┌─ Project Settings ───────────────────────────────────────────────┐
│                                                                  │
│  Project Name                                                    │
│  ┌──────────────────────────────────────────────┐                │
│  │  Agent Message Bus                           │                │
│  └──────────────────────────────────────────────┘                │
│                                                                  │
│  Task Key Prefix                                                 │
│  ┌──────────┐                                                    │
│  │  AMB     │  ← uppercase only, 2-5 chars                      │
│  └──────────┘                                                    │
│  Tasks will be numbered as AMB-0001, AMB-0002, etc.              │
│  ⚠ Changing prefix only affects new tasks.                       │
│     Existing keys (e.g. AMB-0042) will not change.               │
│                                                                  │
│                                   [Cancel]  [Save]               │
└──────────────────────────────────────────────────────────────────┘
```

### UX-правила taskPrefix

1. **Input:** `max-w-[120px]`, `uppercase`, `font-mono`, `tracking-wider`
2. **Inline validation:**
   - При вводе автоматический `toUpperCase()`
   - Ошибка если < 2 или > 5 символов: «Prefix must be 2-5 uppercase Latin characters»
   - Ошибка если не-Latin: «Only A-Z allowed»
   - Ошибка уникальности (от API): «Prefix "AMB" is already used by another project»
3. **Preview:** под полем ввода — live preview: `Tasks will be numbered as {PREFIX}-0001, {PREFIX}-0002, etc.`
4. **Warning:** при изменении существующего prefix — inline alert: «Changing prefix only affects new tasks. Existing keys will not change.»
5. **Empty state (новый проект):** если prefix ещё не задан — показать hint: «Set a prefix to enable issue keys (e.g. AMB, API, OPS)»
6. **Save:** debounced API call на `PATCH /api/projects/:id` с validation

---

## 8. States: Empty / Loading / Error

### Empty States

| Экран | Условие | Сообщение | CTA |
|-------|---------|-----------|-----|
| All Issues (no issues) | `issues.length === 0` без фильтров | «No issues yet. Create your first issue to get started.» | `[+ New Issue]` |
| All Issues (filtered, no results) | `issues.length === 0` с фильтрами | «No issues match your filters.» | `[Clear filters]` |
| Epics | `epics.length === 0` | «No epics yet. Group related issues into epics for better planning.» | `[+ New Epic]` |
| Sprints | `sprints.length === 0` | «No sprints yet. Create a sprint to plan your iteration.» | `[+ New Sprint]` |
| Sprint detail (no issues) | sprint существует, но нет issues | «No issues in this sprint. Assign issues from All Issues tab.» | `[Go to All Issues]` |
| Epic detail (no issues) | epic существует, но нет issues | «No issues in this epic. Assign issues from All Issues tab.» | `[Go to All Issues]` |
| taskPrefix not set | проект без prefix | «Set a task prefix in project settings to enable issue keys.» | `[Open Settings]` |

### Loading States

- **Tab counters:** shimmer placeholder `[░░]` пока данные не загрузились
- **List/table:** skeleton rows (3-5 строк shimmer)
- **Kanban:** skeleton cards в каждой колонке
- **Sprint/Epic list:** skeleton cards (2-3)
- **Progress bar:** shimmer bar

### Error States

- **API error:** inline banner (`destructive` variant) над контентом: «Failed to load issues. [Retry]»
- **Validation errors:** inline под полем ввода, `text-destructive text-sm`
- **Conflict (duplicate prefix):** toast notification + inline error

---

## 9. Дополнительные рекомендации

### Optimistic UI

| Операция | Optimistic behavior |
|----------|---------------------|
| Создание issue | Появляется в списке мгновенно с shimmer key → при ответе API заменяется реальным key |
| Drag-n-drop state (kanban) | Карточка перемещается мгновенно, при ошибке — возврат с toast |
| Assign epic/sprint | Пилюля module/cycle появляется мгновенно, при ошибке — исчезает с toast |
| Start/Complete sprint | Status badge обновляется мгновенно |

### Message Grouping (kanban)

- В kanban view при фильтрации по sprint — показывать только задачи этого спринта
- Пилюля модуля (epic) помогает визуально группировать задачи без swimlanes
- Будущее: swimlanes по epic в kanban (out of scope для MVP)

### Responsive Breakpoints

| Breakpoint | Изменение |
|------------|-----------|
| `< 640px` (mobile) | Сайдбар → Sheet/drawer или горизонтальные табы; kanban → одна колонка; таблица → карточки |
| `640-1024px` (tablet) | Kanban 2 колонки; колонки Module/Cycle в таблице можно склеить |
| `> 1024px` (desktop) | Сайдбар + основная область; kanban 4 колонки по state; полная таблица |

### Accessibility

- **Сайдбар:** `nav` с `aria-label` вроде «Task sections»; пункты — ссылки или `role="menuitemradio"` с текущим разделом через `aria-current="page"`.
- **Горизонтальные табы (fallback):** `role="tablist"`, навигация `←` `→`.
- Пилюли module/cycle — `aria-label` с полным названием: `aria-label="Epic: Auth Flow, Status: Open"`
- Sprint lifecycle buttons — `aria-label` с описанием действия
- Progress bar — `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax`
- Color не единственный способ передачи информации (всегда + текст/иконка)

---

## 10. Связь с задачами frontend (E9A/E9B/E9C)

| UX Section | Связанные задачи | Приоритет реализации |
|------------|------------------|---------------------|
| Навигация (сайдбар Plane-style или табы Navigation 2.0) | E9C-028 | Первый — структура влияет на всё |
| Issue key display | E9A-019, E9A-020, E9A-021 | Второй — с E9A Phase 4 |
| taskPrefix settings | E9A-018 | Второй — с E9A Phase 4 |
| Epic badge | E9B-028 | Третий — с E9B Phase 4 |
| Epic list/detail | E9B-023, E9B-024, E9B-025 | Третий |
| Epic assignment | E9B-027 | Третий |
| Sprint badge | E9C-033 | Четвёртый — с E9C Phase 4 |
| Sprint list/detail | E9C-029, E9C-030, E9C-031 | Четвёртый |
| Sprint filters | E9C-034, E9C-035 | Четвёртый |
| Epic → Sprint visibility | E9C-036 | Четвёртый |

---

## Changelog

| Дата | Версия | Изменения |
|------|--------|-----------|
| 2026-03-26 | 1.0 | Первый UX review по PRD Issue Keys, Epics & Sprints |
| 2026-03-26 | 1.1 | Выравнивание с Plane: сайдбар разделов, mapping Module/Cycle, плотность списка (key + title), лёгкие пилюли epic/sprint; альтернатива табами (Navigation 2.0), mobile Sheet |
