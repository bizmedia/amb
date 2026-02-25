# Agent Message Bus (AMB)

Локальная шина сообщений для оркестрации ИИ-агентов. Репозиторий: [github.com/bizmedia/amb](https://github.com/bizmedia/amb).

![Dashboard](docs/screen.png)

## Чем является (текущее состояние)

- **Локальный dev-инструмент** — запуск на своей машине или в Docker; без облачного сервиса.
- **Шина сообщений** — треды, inbox, ACK, retry, DLQ для оркестрации ИИ-агентов.
- **Монолит на Next.js** — одно приложение: REST API + Dashboard UI, PostgreSQL.
- **SDK + MCP** — TypeScript SDK и MCP-сервер для Cursor (и других MCP-клиентов).
- **Без аутентификации** — открытый API для локального использования; сценарий одного пользователя / одного проекта.
- **Ориентация на разработку** — быстрый старт, seed агентов, примеры, сценарии оркестратора.

## Чем не является (пока)

- **Не облачный сервис** — вы запускаете его сами; публичного SaaS нет.
- **Не multi-tenant** — нет тенантов, проектов и изоляции по проектам.
- **Не production-ready** — нет auth, rate limiting и SLA; только для разработки.
- **Без i18n** — интерфейс и сообщения пока не локализованы.

Дорожная карта (vNext): hosted multi-tenant сервис, API на Nest.js, JWT auth, Dashboard по HTTP — см. [docs/product-vision.md](docs/product-vision.md) и [docs/backlog.md](docs/backlog.md).

## Возможности

- Обмен сообщениями между агентами в рамках тредов
- Inbox с ACK, retry и DLQ
- TypeScript SDK
- Интеграция с MCP-сервером
- Dashboard UI
- Сценарии оркестратора

## Быстрый старт

### Вариант 1: Локальная разработка (рекомендуется)

```bash
# 1. Установить зависимости
pnpm install

# 2. Запустить PostgreSQL (Docker или Podman)
docker compose up -d postgres
# или: podman compose up -d postgres

# 3. Скопировать файл окружения
cp .env.example .env

# 4. Выполнить миграции БД
pnpm db:migrate

# 5. Запустить dev-сервер
pnpm dev
```

Откройте [http://localhost:3333](http://localhost:3333), чтобы убедиться, что сервер запущен.

```bash
# 6. Засеять агентов (нужен запущенный сервер)
pnpm seed:agents
```

### Вариант 2: Полный запуск в Docker/Podman

```bash
# Собрать и запустить PostgreSQL + Next.js приложение (дождитесь запуска обоих контейнеров)
docker compose up -d --build
# или: podman compose up -d --build

# Применить миграции внутри контейнера app
docker compose exec app pnpm db:migrate:deploy
# или: podman compose exec app pnpm db:migrate:deploy

# Засеять данные
docker compose exec app pnpm seed:agents
```

Если при запуске сидов в контейнере возникает `ECONNREFUSED`, засевайте с хоста (приложение должно быть запущено и доступно на порту 3333): `MESSAGE_BUS_URL=http://localhost:3333 pnpm seed:agents`.

Если контейнер `app` не запущен, миграции можно применить с хоста (при настроенном `DATABASE_URL` в `.env`): `pnpm db:migrate:deploy`.

Откройте [http://localhost:3333](http://localhost:3333)

> **Важно:** MCP-сервер запускается локально через Cursor (stdio), не в Docker.

### Команды для работы с БД

```bash
pnpm db:migrate        # Создать/применить миграции (dev)
pnpm db:migrate:deploy # Применить миграции (prod)
pnpm db:studio         # Открыть Prisma Studio (GUI)
pnpm reset-db          # Сбросить БД и засеять заново
```

## Скрипты

| Команда | Описание |
|---------|----------|
| `pnpm dev` | Запустить dev-сервер |
| `pnpm build` | Сборка для production |
| `pnpm seed:agents` | Засеять агентов из реестра |
| `pnpm seed:threads` | Засеять треды по умолчанию |
| `pnpm seed:all` | Засеять агентов и треды |
| `pnpm reset-db` | Сбросить БД и засеять заново |
| `pnpm worker:retry` | Запустить retry-воркер |
| `pnpm cleanup` | Очистить старые сообщения |
| `pnpm orchestrator` | Запустить сценарий оркестратора |
| `pnpm mcp:build` | Собрать MCP-сервер |

## Документация API

Полное описание API с примерами: [docs/api.md](docs/api.md).

Краткая справка:

- **Агенты:** `GET /api/agents`, `POST /api/agents`, `GET /api/agents/search?q=`
- **Треды:** `GET /api/threads`, `POST /api/threads`, `GET /api/threads/:id`, `PATCH /api/threads/:id`, `DELETE /api/threads/:id`, `GET /api/threads/:id/messages`
- **Сообщения:** `POST /api/messages/send`, `GET /api/messages/inbox?agentId=`, `POST /api/messages/:id/ack`
- **DLQ:** `GET /api/dlq`, `POST /api/dlq/:id/retry`, `POST /api/dlq/retry-all`

## Использование SDK

```typescript
import { createClient } from "./lib/sdk";

const client = createClient("http://localhost:3333");

// Регистрация агента
const agent = await client.registerAgent({
  name: "my-agent",
  role: "worker",
});

// Создание треда
const thread = await client.createThread({ title: "Task" });

// Отправка сообщения
await client.sendMessage({
  threadId: thread.id,
  fromAgentId: agent.id,
  payload: { text: "Hello" },
});

// Опрос inbox
for await (const messages of client.pollInbox(agent.id)) {
  for (const msg of messages) {
    console.log(msg.payload);
    await client.ackMessage(msg.id);
  }
}
```

## Интеграция с MCP

1. Собрать MCP-сервер:

```bash
cd mcp-server && pnpm install && pnpm build
```

2. Добавить в настройки Cursor:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "node",
      "args": ["<путь>/mcp-server/dist/index.js"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:3333"
      }
    }
  }
}
```

Доступные MCP-инструменты:
- `list_agents`, `register_agent`
- `list_threads`, `create_thread`, `get_thread`, `update_thread`, `close_thread`
- `get_thread_messages`, `send_message`
- `get_inbox`, `ack_message`
- `get_dlq`

## Использование в другом проекте

### Вариант 1: Сервис в Docker (рекомендуется)

Запустить Message Bus как отдельный сервис и подключаться по HTTP:

```bash
# Запустить Message Bus
docker compose up -d

# Подключиться из своего приложения
curl http://localhost:3333/api/agents
```

### Вариант 2: Копирование SDK

Скопировать файлы SDK в проект для типизированного клиента:

```bash
cp -r lib/sdk your-project/lib/message-bus-sdk
```

```typescript
import { createClient } from "./lib/message-bus-sdk";

const client = createClient("http://localhost:3333");
const agent = await client.registerAgent({ name: "my-service", role: "worker" });
```

### Вариант 3: MCP в Cursor

Добавить в `.cursor/mcp.json` вашего проекта:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": { "MESSAGE_BUS_URL": "http://localhost:3333" }
    }
  }
}
```

Подробнее: [docs/getting-started.md](docs/getting-started.md).

## Структура проекта

```
.cursor/
  agents/         # Системные промпты агентов
  mcp.json        # Пример конфига MCP
app/
  api/            # API-маршруты
  page.tsx        # Dashboard
components/
  dashboard/      # UI-компоненты
  ui/             # shadcn-компоненты
lib/
  sdk/            # TypeScript SDK
  services/       # Бизнес-логика
  hooks/          # React hooks
mcp-server/       # MCP-сервер
scripts/          # Скрипты
examples/         # Примеры использования SDK
prisma/
  schema.prisma   # Схема БД
```

## Агенты

| Роль | Описание |
|------|----------|
| `po` | Product Owner |
| `architect` | Системный архитектор |
| `dev` | Разработчик |
| `qa` | QA-инженер |
| `devops` | DevOps-инженер |
| `sdk` | Разработчик SDK |
| `ux` | UX-дизайнер |
| `orchestrator` | Оркестратор сценариев |

## Поток сообщений

```
Agent A                    Message Bus                    Agent B
   │                           │                            │
   │── sendMessage() ─────────>│                            │
   │                           │── store (pending) ────────>│
   │                           │                            │
   │                           │<── pollInbox() ────────────│
   │                           │── deliver ────────────────>│
   │                           │                            │
   │                           │<── ackMessage() ───────────│
   │                           │── mark (ack) ─────────────>│
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DATABASE_URL` | Строка подключения к PostgreSQL | `postgresql://postgres:postgres@localhost:5432/messagebus` |
| `PORT` | Порт сервера | `3333` |

Полный список: `.env.example`.

## Устранение неполадок

> Во всех командах ниже вместо `docker compose` можно использовать `podman compose`, если у вас установлен Podman.

### Нет подключения к БД

```bash
# Проверить, запущен ли PostgreSQL
docker compose ps

# Перезапустить PostgreSQL
docker compose restart postgres

# Посмотреть логи
docker compose logs postgres
```

### Prisma client не сгенерирован

```bash
pnpm prisma generate
```

### Ошибки миграций

```bash
# Сбросить БД (ВНИМАНИЕ: удаляет все данные)
pnpm reset-db

# Или вручную
pnpm prisma migrate reset
```

### Порт уже занят

```bash
# Найти процесс на порту 3333
lsof -i :3333

# Завершить процесс
kill -9 <PID>
```

### Очистка Docker

```bash
# Остановить контейнеры
docker compose down

# Удалить тома (удаляет данные)
docker compose down -v

# Пересобрать образы
docker compose build --no-cache
```

## Документация

- [Getting Started](docs/getting-started.md) — подробное руководство
- [Сценарии использования AMB](docs/use-cases.md) — все варианты применения (REST, SDK, MCP, workflow, DLQ)
- [API Reference](docs/api.md) — описание API
- [Architecture](docs/architecture.md) — архитектура системы
- [Changelog](CHANGELOG.md) — история изменений

## Участие в разработке

Мы приветствуем контрибуции. Подробнее: [CONTRIBUTING.md](CONTRIBUTING.md) (как сообщать об ошибках, процесс Pull Request, стандарты кода).

## Лицензия

MIT — см. файл [LICENSE](LICENSE).
