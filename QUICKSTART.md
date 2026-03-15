# Quickstart — Agent Message Bus (AMB)

Запуск и первое сообщение за 5 минут. Репозиторий: [github.com/bizmedia/amb](https://github.com/bizmedia/amb).

---

## Что нужно сделать

Чтобы начать использовать AMB для разработки с ИИ-агентами:

### 1. Запустить AMB локально

| Шаг | Действие |
|-----|----------|
| 1 | Клонировать репо, `pnpm install` |
| 2 | Поднять PostgreSQL: `docker compose up -d postgres` |
| 3 | `cp .env.example .env`, затем `pnpm db:migrate` |
| 4 | Запустить сервер: `pnpm dev` (Dashboard: http://localhost:3333) |
| 5 | В отдельном терминале: `pnpm seed:agents` — создать агентов (po, architect, dev и др.) |

После этого AMB уже работает: можно слать сообщения по API или через SDK.

### 2. Подключить ИИ-агентов в Cursor (MCP)

Чтобы агенты в Cursor могли пользоваться шиной:

1. Собрать MCP-сервер: `pnpm mcp:build`
2. В Cursor: **Settings → MCP** добавить конфиг (подставьте свой путь к репо):

   ```json
   {
     "mcpServers": {
       "message-bus": {
         "command": "node",
         "args": ["<абсолютный-путь>/amb/packages/mcp-server/dist/index.js"],
         "env": {
          "MESSAGE_BUS_URL": "http://localhost:3333",
          "MESSAGE_BUS_PROJECT_ID": "<PROJECT_ID>"
         }
       }
     }
   }
   ```

3. Перезапустить Cursor (или перезагрузить MCP).

`PROJECT_ID` можно получить в Dashboard: создайте проект в шапке и скопируйте его ID кнопкой `ID`.

После этого агентам будут доступны инструменты: `list_agents`, `create_thread`, `send_message`, `get_inbox`, `ack_message` и др.

### 3. Проверка

- **Вручную:** создать тред, отправить сообщение (curl или примеры ниже), проверить inbox и ACK.
- **Через Cursor:** попросить агента, например: «создай тред в message bus и отправь сообщение агенту dev» — он должен вызвать MCP-инструменты.

### Итого

| Цель | Минимум |
|------|---------|
| Только API/SDK | Шаги 1–5 выше (сервер + seed). |
| Разработка с ИИ-агентами в Cursor | Шаги 1–5 + сборка MCP и настройка Cursor (п. 2). |

---

## Требования

- Node.js 20+
- pnpm 9+
- Docker (для PostgreSQL)

---

## 1. Установка

```bash
git clone https://github.com/bizmedia/amb.git && cd amb
pnpm install
```

---

## 2. База данных

```bash
docker compose up -d postgres
cp .env.example .env
pnpm db:migrate
```

---

## 3. Запуск сервера

```bash
pnpm dev
```

Откройте http://localhost:3333 — должен открыться Dashboard.

---

## 4. Seed агентов

> Выполняйте в **отдельном терминале** — сервер должен быть запущен.

```bash
pnpm seed:agents
```

Ожидаемый вывод:

```
✅ Created: po → <uuid>
✅ Created: architect → <uuid>
✅ Created: dev → <uuid>
...
🎉 Agent seeding complete.
```

---

## 5. Отправить первое сообщение

### Создать тред

```bash
curl -s -X POST http://localhost:3333/api/threads \
  -H "Content-Type: application/json" \
  -d '{"title": "my-first-thread"}' | jq '.data.id'
```

Сохраните `THREAD_ID` из ответа.

### Получить ID агентов

```bash
curl -s http://localhost:3333/api/agents | jq '.data[] | {id, role}'
```

Сохраните `FROM_AGENT_ID` и `TO_AGENT_ID`.

### Отправить сообщение

```bash
curl -s -X POST http://localhost:3333/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "<THREAD_ID>",
    "fromAgentId": "<FROM_AGENT_ID>",
    "toAgentId": "<TO_AGENT_ID>",
    "payload": {"type": "task", "text": "Hello from quickstart"}
  }' | jq '.data.id'
```

### Проверить inbox получателя

```bash
curl -s "http://localhost:3333/api/messages/inbox?agentId=<TO_AGENT_ID>" | jq '.data'
```

Статус сообщения: `pending`.

### Подтвердить получение (ACK)

```bash
curl -s -X POST http://localhost:3333/api/messages/<MESSAGE_ID>/ack | jq '.data.status'
```

Ожидаемый ответ: `"ack"`.

---

## 6. TypeScript SDK (опционально)

```typescript
import { createClient } from "./lib/sdk";

const client = createClient("http://localhost:3333");

const agent = await client.registerAgent({ name: "my-agent", role: "worker" });
const thread = await client.createThread({ title: "Task" });

await client.sendMessage({
  threadId: thread.id,
  fromAgentId: agent.id,
  payload: { type: "greeting", text: "Hello!" },
});

for await (const messages of client.pollInbox(agent.id)) {
  for (const msg of messages) {
    console.log(msg.payload);
    await client.ackMessage(msg.id);
  }
}
```

Запуск примеров:

```bash
pnpm example:simple    # регистрация агента + отправка сообщения
pnpm example:inbox     # polling inbox с ACK
pnpm example:workflow  # orchestration workflow
```

---

## 7. MCP-интеграция с Cursor (опционально)

```bash
pnpm mcp:build
```

Добавьте в настройки Cursor (`Settings → MCP`):

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "node",
      "args": ["<абсолютный-путь>/packages/mcp-server/dist/index.js"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:3333",
        "MESSAGE_BUS_PROJECT_ID": "<PROJECT_ID>"
      }
    }
  }
}
```

После этого AI-агенты в Cursor получат доступ к инструментам: `list_agents`, `create_thread`, `send_message`, `get_inbox`, `ack_message` и др.

---

## Полезные команды

| Команда | Описание |
|---|---|
| `pnpm dev` | Запустить сервер разработки |
| `pnpm db:migrate` | Применить миграции |
| `pnpm db:studio` | Открыть Prisma Studio (GUI для БД) |
| `pnpm seed:all` | Засеять агентов и треды |
| `pnpm reset-db` | Сбросить БД и пересеять |
| `pnpm worker:retry` | Запустить retry-воркер |
| `pnpm cleanup` | Очистить старые сообщения |

---

## Устранение неполадок

**`ECONNREFUSED` при `pnpm seed:agents`**
→ Сервер не запущен. Сначала выполните `pnpm dev`.

**`DATABASE_URL` не найден**
→ Выполните `cp .env.example .env`.

**Ошибка подключения к PostgreSQL**
→ Проверьте: `docker compose ps`. Если контейнер не запущен: `docker compose up -d postgres`.

**Порт 3333 занят**
→ `lsof -i :3333` — найдите процесс, `kill -9 <PID>` — завершите его.

**Prisma client не сгенерирован**
→ `pnpm prisma generate`

---

## Документация

- [Getting Started](docs/getting-started.md) — подробное руководство + cookbook
- [API Reference](docs/api.md) — полная документация API
- [Architecture](docs/architecture.md) — архитектура системы
