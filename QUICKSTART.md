# Quickstart — Agent Message Bus (AMB)

Запуск и первое сообщение за несколько минут. Репозиторий: [github.com/bizmedia/amb](https://github.com/bizmedia/amb).

---

## Самый быстрый путь: готовый образ `docker.io/openaisdk/amb:latest`

Образ на Docker Hub — это **собранное приложение `apps/web`** (Next.js: Dashboard и BFF-роуты `/api/*` к бэкенду). Рядом из исходников репозитория поднимаются **PostgreSQL** и **`apps/api`** (NestJS): первый запуск API собирается в контейнере; **`apps/web` из образа не пересобирается**.

**Нужно:** [Docker](https://docs.docker.com/get-docker/) или [Podman](https://podman.io/) с Compose.

```bash
git clone https://github.com/bizmedia/amb.git && cd amb

docker pull docker.io/openaisdk/amb:latest
docker compose -f docker-compose.web-image.yml up -d
```

С Podman:

```bash
podman pull docker.io/openaisdk/amb:latest
podman compose -f docker-compose.web-image.yml up -d
```

Дождитесь завершения сервиса `seed` (логин в Dashboard и базовые данные):

```bash
docker compose -f docker-compose.web-image.yml logs -f seed
```

Дальше:

- Dashboard: http://localhost:3333  
- Проверка API: `curl -s http://localhost:3334/api/health`  
- Postgres с хоста: порт **5433** (см. `docker-compose.web-image.yml`)

Из корня репозитория **`pnpm deploy:local`** / **`pnpm deploy:amb`** поднимают тот же стек с портами **4333 / 4334** на хосте — так можно параллельно держать **`pnpm dev`** на **3333 / 3334**. Только compose без pnpm — как в таблице выше (**3333 / 3334**).

**Образ ещё не опубликован или pull падает** — поднимите полный стек со сборкой UI из репозитория:

```bash
docker compose up -d --build
```

Файл стека с готовым веб-образом: [`docker-compose.web-image.yml`](docker-compose.web-image.yml) (держите в уме синхронизацию с [`docker-compose.yml`](docker-compose.yml) при изменениях).

---

## Что нужно сделать

Чтобы начать использовать AMB для разработки с ИИ-агентами:

### 1. Запустить AMB локально

| Шаг | Действие |
|-----|----------|
| **A (быстрее всего)** | Клонировать репо → `docker pull docker.io/openaisdk/amb:latest` → `docker compose -f docker-compose.web-image.yml up -d` → дождаться `seed` |
| **B (без Hub)** | Клонировать репо → `docker compose up -d --build` |
| **C (код на хосте)** | Клонировать → `pnpm deploy:dev:db` (Postgres на **5434**, отдельно от полного стека) → скопировать `apps/api/.env.example` и `apps/web/.env.example` в `.env` → `pnpm install` → `pnpm db:migrate` → `pnpm dev` → в другом терминале `pnpm seed:agents` |

После этого AMB уже работает: можно слать сообщения по API или через SDK.

### 2. Подключить ИИ-агентов в Cursor (MCP)

Чтобы агенты в Cursor могли пользоваться шиной:

1. Собрать MCP-сервер: `pnpm install && pnpm mcp:build`
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
| Только API/SDK | Вариант A, B или C из таблицы выше (в A/B seed идёт из compose). |
| Разработка с ИИ-агентами в Cursor | Запуск стека + сборка MCP и настройка Cursor (п. 2). |

---

## Требования

- **Путь A/B:** Docker или Podman + Compose; клон репозитория.
- **Путь C:** Node.js 20+, pnpm (версия в `package.json` → `packageManager`), Docker только для PostgreSQL.

---

## 1. Установка (путь с кодом на хосте)

```bash
git clone https://github.com/bizmedia/amb.git && cd amb
pnpm install
```

---

## 2. База данных (путь C)

```bash
pnpm deploy:dev:db
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# DATABASE_URL в примерах — localhost:5434 (docker-compose.dev.yml), не путать с портом 5433 у полного compose
pnpm db:migrate
```

---

## 3. Запуск сервера (путь C)

```bash
pnpm dev
```

Откройте http://localhost:3333 — должен открыться Dashboard (в терминале также подскажут URL Swagger, если включён).

---

## 4. Seed агентов (путь C)

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
import { createClient } from "@amb-app/sdk";

const client = createClient({
  baseUrl: "http://localhost:3333",
  token: process.env.AMB_TOKEN,
  projectId: process.env.AMB_PROJECT_ID,
});

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

Запуск примеров из корня монорепо:

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
| `pnpm dev` | Next + Nest в dev-режиме |
| `pnpm db:migrate` | Миграции (dev) |
| `pnpm db:studio` | Prisma Studio |
| `pnpm seed:all` | Засеять агентов и треды |
| `pnpm --filter @amb-app/db exec prisma generate` | Сгенерировать Prisma Client |
| `pnpm --filter @amb-app/db exec prisma migrate reset` | Сброс БД (удаляет данные) |

---

## Устранение неполадок

**`ECONNREFUSED` при `pnpm seed:agents`**
→ Сервер не запущен. Сначала выполните `pnpm dev` (путь C) или проверьте `docker compose ps` (путь A/B).

**`DATABASE_URL` не найден**
→ Скопируйте `apps/api/.env.example` → `apps/api/.env` и `apps/web/.env.example` → `apps/web/.env`.

**Ошибка подключения к PostgreSQL**
→ Путь C: `pnpm deploy:dev:db`, с хоста порт **5434** (`docker-compose.dev.yml`). Путь A/B: `docker compose ps`, при необходимости `docker compose up -d postgres`, порт **5433**.

**Порт 3333 занят**
→ `lsof -i :3333` — найдите процесс, `kill -9 <PID>` — завершите его.

**Prisma client не сгенерирован**
→ `pnpm --filter @amb-app/db exec prisma generate`

**Pull `openaisdk/amb:latest` не находит образ**
→ Используйте `docker compose up -d --build` или соберите и опубликуйте образ (в репозитории: `pnpm docker:compose:publish` — по умолчанию через Podman).

---

## Документация

- [README.md](README.md) — обзор и запуск в Docker/Podman
- [Getting Started](docs/getting-started.md) — подробное руководство + cookbook
- [API Reference](docs/api.md) — полная документация API
- [Architecture](docs/architecture.md) — архитектура системы
