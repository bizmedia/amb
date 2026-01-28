# Начало работы

Пошаговое руководство для разработчиков.

## Содержание

1. [Быстрый старт (5 минут)](#быстрый-старт-5-минут)
2. [Рекомендации](#рекомендации)
3. [Поваренная книга разработчика](#поваренная-книга-разработчика)

---

# Быстрый старт (5 минут)

Запустите систему и отправьте первое сообщение между агентами.

## Шаг 1: Настройка (2 мин)

```bash
# Клонировать и установить
git clone <repo-url> && cd mcp-message-bus
pnpm install

# Запустить PostgreSQL
docker compose up -d postgres

# Настроить и запустить
cp .env.example .env
pnpm db:migrate
pnpm seed:agents
pnpm dev
```

**Проверка:** Откройте http://localhost:3333 — вы должны увидеть Dashboard.

## Шаг 2: Создать тред (1 мин)

```bash
curl -X POST http://localhost:3333/api/threads \
  -H "Content-Type: application/json" \
  -d '{"title": "my-first-thread"}'
```

Ответ:
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "my-first-thread",
    "status": "open"
  }
}
```

Сохраните `id` треда.

## Шаг 3: Получить ID агентов (30 сек)

```bash
curl http://localhost:3333/api/agents | jq '.data[0:2]'
```

Ответ (пример):
```json
{
  "data": [
    {"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Developer", "role": "dev"},
    {"id": "550e8400-e29b-41d4-a716-446655440002", "name": "QA Engineer", "role": "qa"}
  ]
}
```

Сохраните значения `id` для агентов `dev` и `qa`.

## Шаг 4: Отправить сообщение (1 мин)

```bash
curl -X POST http://localhost:3333/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "<thread-uuid>",
    "fromAgentId": "<dev-uuid>",
    "toAgentId": "<qa-uuid>",
    "payload": {"task": "Review this PR", "pr": 42}
  }'
```

## Шаг 5: Проверить входящие получателя (30 сек)

```bash
curl "http://localhost:3333/api/messages/inbox?agentId=<qa-uuid>"
```

Вы должны увидеть сообщение со статусом `pending`.

## Шаг 6: Подтвердить получение

```bash
curl -X POST http://localhost:3333/api/messages/<message-uuid>/ack
```

**Готово!** Вы отправили и подтвердили первое сообщение.

---

# Рекомендации

Рекомендации по эффективному использованию Agent Message Bus.

## 1. Структура тредов

### ✅ Один тред — одна задача

```
feature-auth-login     ← конкретная фича
bugfix-api-timeout     ← конкретный баг
release-v1.2.0         ← конкретный релиз
```

### ❌ Не делайте так

```
general-discussion     ← слишком широко
dev-tasks              ← слишком абстрактно
```

### Именование тредов

| Тип задачи | Паттерн | Пример |
|-----------|---------|---------|
| Feature | `feature-<name>` | `feature-csv-export` |
| Bugfix | `bugfix-<description>` | `bugfix-login-timeout` |
| Release | `release-v<version>` | `release-v1.2.0` |
| Incident | `incident-<code>` | `incident-2026-01-27-db` |
| Review | `review-<type>-<id>` | `review-pr-142` |

## 2. Адресация сообщений

### Прямое сообщение → конкретному агенту

```json
{
  "toAgentId": "550e8400-e29b-41d4-a716-446655440000",
  "payload": {"task": "Test endpoint /api/users"}
}
```

### Broadcast → всем агентам в треде

```json
{
  "toAgentId": null,
  "payload": {"announcement": "Release delayed by 1 hour"}
}
```

### @упоминания в payload

```json
{
  "payload": {
    "text": "@dev fix the bug, @qa verify after fix",
    "mentions": ["dev", "qa"]
  }
}
```

## 3. Жизненный цикл сообщения

### Всегда подтверждайте обработку

```typescript
for await (const messages of client.pollInbox(agentId)) {
  for (const msg of messages) {
    try {
      await processMessage(msg);      // Обработать
      await client.ackMessage(msg.id); // ACK после успеха
    } catch (error) {
      console.error("Failed:", error);
      // Не подтверждать — сообщение останется для повтора
    }
  }
}
```

### Мониторинг DLQ

```bash
# Проверяйте периодически
curl http://localhost:3333/api/dlq

# Если есть сообщения — выясните причину
curl -X POST http://localhost:3333/api/dlq/<id>/retry
```

## 4. Структура payload

### Используйте типизированные payload

```typescript
interface TaskPayload {
  type: "task";
  action: string;
  data: Record<string, unknown>;
  priority?: "low" | "medium" | "high";
}

interface ResponsePayload {
  type: "response";
  parentMessageId: string;
  status: "success" | "error";
  result?: unknown;
  error?: string;
}
```

### Пример: задача → ответ

```json
// Задача от orchestrator → dev
{
  "type": "task",
  "action": "implement-feature",
  "data": {"feature": "csv-export", "spec": "..."}
}

// Ответ от dev → orchestrator
{
  "type": "response",
  "parentMessageId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "result": {"files": ["lib/csv.ts", "app/api/export/route.ts"]}
}
```

## 5. Стратегии polling

### Для интерактивной работы

```typescript
// Быстрый polling для UI
client.pollInbox(agentId, { interval: 1000 }); // 1 сек
```

### Для фоновых воркеров

```typescript
// Эффективный polling для воркеров
client.pollInbox(agentId, { interval: 5000 }); // 5 сек
```

### Корректное завершение

```typescript
const controller = new AbortController();

process.on("SIGINT", () => controller.abort());
process.on("SIGTERM", () => controller.abort());

for await (const msgs of client.pollInbox(agentId, { 
  signal: controller.signal 
})) {
  // ...
}
```

## 6. Закрытие тредов

### Закрывайте завершённые треды

```bash
curl -X PATCH http://localhost:3333/api/threads/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "closed"}'
```

### Финальное сообщение перед закрытием

```json
{
  "payload": {
    "type": "thread_summary",
    "outcome": "success",
    "summary": "Feature implemented, tested, deployed",
    "participants": ["po", "architect", "dev", "qa", "devops"]
  }
}
```

---

# Поваренная книга разработчика

Готовые рецепты для типичных задач.

## Рецепт 1: Регистрация и запуск агента

```typescript
import { createClient } from "./lib/sdk";

const client = createClient("http://localhost:3333");

// Регистрация с возможностями
const agent = await client.registerAgent({
  name: "my-custom-agent",
  role: "worker",
  capabilities: {
    languages: ["typescript", "python"],
    tools: ["eslint", "pytest"],
  },
});

console.log("Agent ID:", agent.id);
```

## Рецепт 2: Отправка задачи конкретному агенту

```typescript
// Найти агента по роли
const agents = await client.listAgents();
const devAgent = agents.find(a => a.role === "dev");

// Отправить задачу
await client.sendMessage({
  threadId: "550e8400-e29b-41d4-a716-446655440000",
  fromAgentId: myAgent.id,
  toAgentId: devAgent.id,
  payload: {
    type: "task",
    action: "fix-bug",
    data: {
      issue: "Login timeout after 30 seconds",
      file: "lib/auth.ts",
      line: 42,
    },
  },
});
```

## Рецепт 3: Обработчик входящих с обработкой типов

```typescript
async function processMessage(msg: Message) {
  const payload = msg.payload as { type: string; [key: string]: unknown };

  switch (payload.type) {
    case "task":
      await handleTask(payload);
      break;
    case "question":
      await handleQuestion(payload);
      break;
    case "notification":
      console.log("Notification:", payload.text);
      break;
    default:
      console.warn("Unknown type:", payload.type);
  }
}

// Цикл polling
for await (const messages of client.pollInbox(agentId)) {
  for (const msg of messages) {
    await processMessage(msg);
    await client.ackMessage(msg.id);
  }
}
```

## Рецепт 4: Workflow с последовательными шагами

```typescript
interface Step {
  agent: string;
  task: string;
}

async function runWorkflow(threadTitle: string, steps: Step[]) {
  const thread = await client.createThread({ title: threadTitle });
  const agents = await client.listAgents();
  const byRole = new Map(agents.map(a => [a.role, a]));

  for (const step of steps) {
    const target = byRole.get(step.agent);
    if (!target) continue;

    await client.sendMessage({
      threadId: thread.id,
      fromAgentId: orchestratorId,
      toAgentId: target.id,
      payload: { type: "task", task: step.task },
    });

    // Опционально: дождаться ответа
    // await waitForResponse(thread.id, target.id);
  }

  return thread;
}

// Использование
await runWorkflow("Deploy v1.2", [
  { agent: "dev", task: "Build release" },
  { agent: "qa", task: "Run smoke tests" },
  { agent: "devops", task: "Deploy to production" },
]);
```

## Рецепт 5: Broadcast всем агентам

```typescript
await client.sendMessage({
  threadId: thread.id,
  fromAgentId: orchestrator.id,
  toAgentId: null,  // ← broadcast
  payload: {
    type: "announcement",
    priority: "high",
    text: "Deployment starts in 5 minutes. Don't merge to main!",
  },
});
```

## Рецепт 6: Ответ на сообщение (Threading)

```typescript
// Полученное сообщение
const incomingMsg = inbox[0];

// Ответ с parentId
await client.sendMessage({
  threadId: incomingMsg.threadId,
  fromAgentId: myAgent.id,
  toAgentId: incomingMsg.fromAgentId,
  parentId: incomingMsg.id,  // ← ссылка на родителя
  payload: {
    type: "response",
    status: "done",
    result: { /* ... */ },
  },
});
```

## Рецепт 7: Повтор из DLQ

```typescript
// Получить все неудачные сообщения
const dlq = await client.getDLQ();

console.log(`In DLQ: ${dlq.length} messages`);

for (const msg of dlq) {
  console.log(`- ${msg.id}: ${msg.retryCount} attempts, from ${msg.fromAgentId}`);
}

// Повторить конкретное сообщение
if (dlq.length > 0) {
  await client.retryDLQMessage(dlq[0].id);
}

// Повторить все
await client.retryAllDLQ();
```

## Рецепт 8: Поиск агентов

```typescript
// По имени или роли
const results = await client.searchAgents("dev");
// Возвращает агентов, где имя или роль содержит "dev"
```

## Рецепт 9: Фильтрация тредов по статусу

```typescript
const allThreads = await client.listThreads();

const openThreads = allThreads.filter(t => t.status === "open");
const closedThreads = allThreads.filter(t => t.status === "closed");

console.log(`Open: ${openThreads.length}, Closed: ${closedThreads.length}`);
```

## Рецепт 10: MCP из Cursor

После настройки `.cursor/mcp.json`:

```
# В чате Cursor:

"Create thread 'bugfix-api' and send task to dev agent:
 fix timeout in /api/users"

# AI выполнит:
# 1. create_thread({ title: "bugfix-api" })
# 2. send_message({ threadId: ..., toAgentId: dev, payload: {...} })
```

---

## Что дальше?

| Ресурс | Описание |
|----------|-------------|
| [API Reference](api.md) | Полная документация API |
| [Architecture](architecture.md) | Обзор архитектуры системы |
| [examples/](../examples/) | Готовые к использованию скрипты |
| http://localhost:3333 | Dashboard UI |

---

*Документация: Январь 2026*
