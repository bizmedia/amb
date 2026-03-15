# MCP Message Bus — инструкция для агентов

Используй эту инструкцию **только если MCP-сервер message-bus доступен** (инструменты message-bus видны в списке доступных MCP tools). Если сервер не подключён или не отвечает — работай как обычно, без шины сообщений.

**Одно и то же:** MCP message-bus, **AMB**, **Agent Message Bus** — разные названия одной и той же системы (шина сообщений для агентов). В документации и в диалоге можно использовать любое из них.

---

## 1. Назначение

Message Bus даёт агентам общий бэкенд для:

* **Координации** — треды (threads), сообщения между агентами, inbox.
* **Бэклога** — issues проекта (состояния BACKLOG, TODO, IN_PROGRESS, DONE, CANCELLED).

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

Типичный цикл: агент вызывает `get_inbox(agentId)` → обрабатывает сообщения → при необходимости отвечает через `send_message` и/или вызывает `ack_message(messageId)`.

### DLQ (Dead Letter Queue)

| Tool | Назначение |
|------|------------|
| `get_dlq` | Сообщения в очереди мёртвых писем (ошибки доставки/обработки). |

Используй для диагностики и отчётов (например, QA, DevOps).

### Issues (задачи проекта)

Все инструменты по issues привязаны к проекту: нужен `projectId` или `MESSAGE_BUS_PROJECT_ID`.

| Tool | Назначение |
|------|------------|
| `list_issues` | Список задач. Фильтры: `state`, `priority`, `assignee`, `dueFrom`, `dueTo`. |
| `create_issue` | Создать задачу. Обязательно: `title`. Опционально: `description`, `state`, `priority`, `assigneeId`, `dueDate`. |
| `get_issue` | Задача по `issueId`. |
| `update_issue` | Обновить задачу (`issueId` + любые поля). |
| `move_issue_state` | Перенести задачу в другой статус (shortcut). Параметры: `issueId`, `state`. |
| `delete_issue` | Удалить задачу по `issueId`. |

Состояния: `BACKLOG`, `TODO`, `IN_PROGRESS`, `DONE`, `CANCELLED`. Приоритеты: `NONE`, `LOW`, `MEDIUM`, `HIGH`, `URGENT`.

---

## 3. Типичные сценарии

* **Узнать участников и треды**  
  `list_project_members` (с projectId при необходимости) → `list_threads`. По треду: `get_thread`, `get_thread_messages`.

* **Создать тред и раздать задачу**  
  `create_thread` с `title` → `list_agents` или `list_project_members` → `send_message(threadId, fromAgentId, payload, toAgentId)`.

* **Взять работу из inbox**  
  Определи свой `agentId` (из `list_agents` / registry). Вызови `get_inbox(agentId)` → обработай сообщения → `ack_message` по обработанным.

* **Вести бэклог в шине**  
  `list_issues` с фильтрами → `create_issue` / `update_issue` / `move_issue_state` по необходимости. Для назначения используй `assigneeId` (UUID агента из проекта).

* **Проверить DLQ**  
  `get_dlq` — для диагностики и отчётов.

---

## 4. Правила

* **Проверяй доступность**: если инструменты message-bus не вызываются (ошибка, таймаут, сервер не в списке MCP) — не полагайся на шину, работай без неё.
* **projectId**: везде, где нужен проект (issues, list_project_members), передавай `projectId` в аргументах или убедись, что задан `MESSAGE_BUS_PROJECT_ID`.
* **Идентификация агента**: для `send_message` и `get_inbox` нужны реальные UUID из `list_agents` / `list_project_members`; не выдумывай ID.
* **payload**: в `send_message` передавай осмысленный JSON (задача, вопрос, результат и т.д.), чтобы другой агент мог обработать сообщение.

---

Файл правила: `.cursor/rules/mcp-message-bus.md`
