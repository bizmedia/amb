# MCP Message Bus — инструкция для агентов

Используй эту инструкцию **только если MCP-сервер message-bus доступен** (инструменты message-bus видны в списке доступных MCP tools). Если сервер не подключён или не отвечает — работай как обычно, без шины сообщений.

**Одно и то же:** MCP message-bus, **AMB**, **Agent Message Bus** — разные названия одной и той же системы (шина сообщений для агентов). В документации и в диалоге можно использовать любое из них.

---

## 1. Назначение

Message Bus даёт агентам общий бэкенд для:

* **Координации** — треды (threads), сообщения между агентами, inbox.
* **Бэклога** — issues проекта (состояния BACKLOG, TODO, IN_PROGRESS, DONE).

Проект задаётся через `MESSAGE_BUS_PROJECT_ID` в окружении или аргументом `projectId` в вызовах инструментов.

---

## 2. Инструменты (кратко)

### Агенты

| Tool | Назначение |
|------|------------|
| `list_agents` | Список всех агентов в шине (глобально). |
| `list_project_members` | Участники текущего проекта (агенты проекта). Нужен `projectId` или `MESSAGE_BUS_PROJECT_ID`. |

Используй их, чтобы знать, кому отправлять сообщения и кто есть в проекте.

### Треды

| Tool | Назначение |
|------|------------|
| `list_threads` | Список тредов. |
| `create_thread` | Создать тред (`title`, опционально `status`: open/closed). |
| `get_thread` | Получить тред по `threadId`. |
| `get_thread_messages` | Сообщения в треде по `threadId`. |
| `update_thread` | Обновить статус треда (`threadId`, `status`: open/closed/archived). |
| `close_thread` | Закрыть тред (shortcut для update_thread с status=closed). |

Тред — контекст обсуждения или задачи; в нём обмениваются сообщениями.

### Сообщения и inbox

| Tool | Назначение |
|------|------------|
| `send_message` | Отправить сообщение в тред. Обязательно: `threadId`, `fromAgentId`, `payload` (JSON). Опционально: `toAgentId` (если пусто — broadcast), `parentId` (ответ на сообщение). |
| `get_inbox` | Входящие сообщения для агента. Обязательно: `agentId`. |
| `ack_message` | Подтвердить получение/обработку сообщения по `messageId`. |

Типичный цикл: агент вызывает `get_inbox(agentId)` → обрабатывает сообщения → **обязательно** `ack_message(messageId)` по каждому обработанному или просмотренному сообщению → при необходимости отвечает через `send_message`.

### Почему у всех в инбоксе «куча непрочитанных»

1. **Статус в БД:** после опроса инбокса сообщение становится `delivered`. Пока не вызван **`ack_message`**, оно **остаётся** в выдаче `get_inbox` — в UI это выглядит как непрочитанное / ожидающее подтверждения.
2. **Broadcast** (`toAgentId` не указан): **одна** строка сообщения попадает в инбокс **каждого** агента проекта (кроме отправителя). Десять broadcast — у двенадцати агентов в списке те же десять, пока их не ack'нут.
3. **Один ack на сообщение:** первый успешный **`ack_message`** переводит сообщение в `ack` — оно **пропадает из инбокса у всех** (это одна запись на всех). Если никто не ack'ает (типично для агентов только в IDE без вызова MCP), очередь только растёт.

**Что делать агентам:** в конце сессии работы по шине — для **каждого** `messageId` из `get_inbox`, с которым ты ознакомился или отработал задачу, вызови **`ack_message`**. Нет действий по письму — всё равно ack, чтобы не копить шум (либо в Dashboard — «Подтвердить все»).

**Оркестратор:** по возможности шли **адресные** сообщения с **`toAgentId`** исполнителя, а не broadcast; broadcast — только для редких сводок. Сообщения **от себя** сам оркестратор через свой инбокс не ack'ает (они не попадают в `get_inbox` отправителя) — очистка зависит от получателей или ручного ack в UI.

### DLQ (Dead Letter Queue)

| Tool | Назначение |
|------|------------|
| `get_dlq` | Сообщения в очереди мёртвых писем (ошибки доставки/обработки). |

Используй для диагностики и отчётов (например, QA, DevOps).

### Задачи проекта (tasks)

В API и Dashboard сущность называется **task**; человекочитаемый ключ — **`AMB-…`**. В MCP инструменты обычно именуются `*_task` (в старых клиентах встречается алиас `issueId` — это тот же id задачи).

Все вызовы привязаны к проекту: нужен `projectId` или `MESSAGE_BUS_PROJECT_ID`.

| Tool | Назначение |
|------|------------|
| `list_tasks` | Список задач. Фильтры: `state`, `priority`, `assignee`, и т.д. |
| `create_task` | Создать задачу. Обязательно: `title`. Опционально: `description`, `state`, `priority`, `assigneeId`, `dueDate`. |
| `get_task` | Задача по `taskId` (или legacy `issueId`). |
| `update_task` | Обновить задачу (`taskId` + поля). |
| `move_task_state` | Статус-kanban shortcut: `taskId`, `state`. |
| `delete_task` | Удалить задачу по `taskId`. |

Состояния: `BACKLOG`, `TODO`, `IN_PROGRESS`, `DONE`. Приоритеты: `NONE`, `LOW`, `MEDIUM`, `HIGH`, `URGENT`.

---

## 3. Типичные сценарии

* **Узнать участников и треды**  
  `list_project_members` (с projectId при необходимости) → `list_threads`. По треду: `get_thread`, `get_thread_messages`.

* **Создать тред и раздать задачу**  
  `create_thread` с `title` → `list_agents` или `list_project_members` → `send_message(threadId, fromAgentId, payload, toAgentId)`.

* **Взять работу из inbox**  
  Определи свой `agentId`. `get_inbox(agentId)` → обработай → **`ack_message` по каждому обработанному id** (иначе «непрочитанные» копятся у всех, особенно после broadcast).

* **Вести бэклог в шине**  
  `list_tasks` с фильтрами → `create_task` / `update_task` / `move_task_state` по необходимости. Назначение: `assigneeId` (UUID агента из `list_project_members`).

* **Проверить DLQ**  
  `get_dlq` — для диагностики и отчётов.

---

## 4. Правила

* **Проверяй доступность**: если инструменты message-bus не вызываются (ошибка, таймаут, сервер не в списке MCP) — не полагайся на шину, работай без неё.
* **projectId**: везде, где нужен проект (issues, list_project_members), передавай `projectId` в аргументах или убедись, что задан `MESSAGE_BUS_PROJECT_ID`.
* **Идентификация агента**: для `send_message` и `get_inbox` нужны реальные UUID из `list_agents` / `list_project_members`; не выдумывай ID.
* **payload**: в `send_message` передавай осмысленный JSON (задача, вопрос, результат и т.д.), чтобы другой агент мог обработать сообщение.
* **Отчёт о проделанном в тред**: по завершении работы отправляй в рабочий тред `send_message` с `completion_report`. Предпочитай **не broadcast**, если отчёт касается только оркестратора: укажи **`toAgentId`** UUID оркестратора (из `list_project_members`). Broadcast допустим для сводок на всю команду — тогда **каждый** заинтересованный агент после прочтения должен **`ack_message`** (или один ack снимает письмо у всех). Если шина недоступна — пропусти шаг.

---

## 5. Отчёт в тред (handoff)

Чтобы команда видела прогресс в Dashboard, а не только в чате IDE:

1. Определи `threadId` открытого треда (или создай тред оркестратором).
2. Вызови `send_message` с `payload` вида: `{ "type": "completion_report", "summary": "…", "tasksTouched": ["AMB-00xx"], "files": ["path/…"], "nextSteps": "…" }`.
3. В v1 сервер материализует связи message ↔ task по `tasksTouched` **только** для `payload.type === "completion_report"`. Если положить `tasksTouched` в другой payload type, это не считается поддерживаемым контрактом.
4. При смене статуса задачи в шине — по возможности `update_task` / `move_task_state` в том же цикле.

---

## 6. Обязанности по ролям (кратко)

| Роль | Шина: что делать |
|------|------------------|
| **orchestrator** | Fan-out с **`toAgentId`** у исполнителя; реже broadcast. После работы со входящими — сам **`ack_message`** по письмам **не от себя**. `orchestrator_sync`, `close_thread`. |
| **po** | `get_inbox` → разбор → **`ack_message`** по каждому просмотренному id → `create_task` / `update_task`; `completion_report` с **`toAgentId`** оркестратора, если не нужен broadcast. |
| **architect** | `get_inbox` → **`ack_message`** → работа → `completion_report`; `move_task_state`. |
| **dev**, **nest-engineer**, **react-next-engineer** | `get_inbox` → **`ack_message`** → код → `move_task_state` → `completion_report` (**`ack_message`** на все прочитанные входящие в той же сессии). |
| **qa** | То же: **`ack_message`** после разбора инбокса; `get_dlq` при необходимости; отчёт; задачи в шине. |
| **ux**, **sdk**, **devops**, **tech-writer**, **open-source** | `get_inbox` → **`ack_message`** → результат → `completion_report` при необходимости. |

---

Файл правила: `.cursor/rules/mcp-message-bus.md`
