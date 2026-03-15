# Agent Message Bus (AMB)

Агенты могут работать в разных средах: один — в Cursor, другой — в Codex, третий — в Claude Code или в своём сервисе. **AMB** — общая шина сообщений: все подключаются по REST API, SDK или MCP и обмениваются задачами и сообщениями в тредах с доставкой, ACK, retry и DLQ.

Репозиторий: [github.com/bizmedia/amb](https://github.com/bizmedia/amb).

![Dashboard](docs/screen.png)

## Диаграмма: что такое AMB

Откройте [Excalidraw-схему AMB](docs/amb-overview.excalidraw), чтобы за 1 минуту понять, для чего нужен продукт, как он работает и какую ценность даёт разработчику.

Landing-style версия для репозитория:
- [Excalidraw (editable)](docs/amb-overview-landing.excalidraw)
- [SVG](docs/amb-overview-landing.svg)
- [PNG](docs/amb-overview-landing.png)

![AMB overview](docs/amb-overview-landing.png)

## Зачем это нужно

Несколько ИИ-агентов (PO, Architect, Dev, QA в Cursor, Codex, Claude Code или свои воркеры) должны передавать друг другу задачи и контекст. Без общей шины это ad-hoc скрипты, потеря сообщений, сложная отладка. AMB даёт треды (темы задач), inbox на каждого агента, подтверждение доставки (ACK), повторы и DLQ. Подключение: REST API, TypeScript SDK или MCP в Cursor, Codex, Claude Code и других клиентах — агенты в чате или воркеры могут создавать треды, слать сообщения, смотреть inbox и DLQ. **Для кого:** разработчики и команды, которые используют несколько ИИ-агентов в разных средах и хотят координировать их через единый поток сообщений локально, без облака.

## Чем является (текущее состояние)

- **Локальный dev-инструмент** — запуск на своей машине или в Docker; без облачного сервиса.
- **Шина сообщений** — треды, inbox, ACK, retry, DLQ для оркестрации ИИ-агентов.
- **Монолит на Next.js** — одно приложение: REST API + Dashboard UI, PostgreSQL.
- **SDK + MCP** — TypeScript SDK и MCP-сервер для Cursor, Codex, Claude Code и других MCP-клиентов.
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
- Интеграция с MCP-сервером (Cursor, Codex, Claude Code и др.)
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
# Предусловие: зависимости уже установлены (pnpm install)

# Поднять полный стек: postgres + migrate + api + web + seed
docker compose up --build
# или: podman compose up -d --build
```

Если порты заняты, переопределите их перед запуском:

```bash
API_PORT=4334 WEB_PORT=4333 docker compose up --build
```

После старта:
- Web: [http://localhost:3333](http://localhost:3333)
- API: [http://localhost:3334](http://localhost:3334)
- Seed-данные создаются сервисом `seed` автоматически.

Если нужен фоновый режим:

```bash
docker compose up -d --build
docker compose logs -f seed
```

> **Важно:** MCP-сервер запускается локально в вашем MCP-клиенте (Cursor, Codex, Claude Code и т.д.), не в Docker.

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
Быстрый гайд интеграции (SDK + REST + примеры): [docs/integration-guide.md](docs/integration-guide.md).

Краткая справка:

- **Агенты:** `GET /api/agents`, `POST /api/agents`, `GET /api/agents/search?q=`
- **Треды:** `GET /api/threads`, `POST /api/threads`, `GET /api/threads/:id`, `PATCH /api/threads/:id`, `DELETE /api/threads/:id`, `GET /api/threads/:id/messages`
- **Сообщения:** `POST /api/messages/send`, `GET /api/messages/inbox?agentId=`, `POST /api/messages/:id/ack`
- **DLQ:** `GET /api/dlq`, `POST /api/dlq/:id/retry`, `POST /api/dlq/retry-all`

## Использование SDK

```typescript
import { createClient, MessageBusError } from "@amb-app/sdk";

const client = createClient({
  baseUrl: "http://localhost:3333",
  token: process.env.AMB_TOKEN,
  projectId: process.env.AMB_PROJECT_ID,
});

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

try {
  await client.listThreads();
} catch (error) {
  if (error instanceof MessageBusError && error.isAuthError) {
    console.error("AMB auth error, check token/project scope");
  }
}
```

## Интеграция с MCP

Перед настройкой MCP можно создать отдельный проект в Dashboard:

1. Откройте `http://localhost:3333`.
2. В шапке выберите **Создать проект**.
3. Скопируйте **ID проекта** кнопкой `ID`.

1. Собрать MCP-сервер:

```bash
pnpm install && pnpm mcp:build
```

2. Добавить в настройки Cursor:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "node",
      "args": ["<путь>/packages/mcp-server/dist/index.js"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:3333",
        "MESSAGE_BUS_PROJECT_ID": "<PROJECT_ID>"
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

Аналогично настраивается MCP в Codex, Claude Code и других клиентах с поддержкой MCP (конфиг зависит от клиента).

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
cp -r packages/sdk/src your-project/lib/message-bus-sdk
```

```typescript
import { createClient } from "./lib/message-bus-sdk";

const client = createClient({
  baseUrl: "http://localhost:3333",
  token: process.env.AMB_TOKEN,
  projectId: process.env.AMB_PROJECT_ID,
});
const agent = await client.registerAgent({ name: "my-service", role: "worker" });
```

### Вариант 3: MCP в Cursor, Codex или другом клиенте (AMB в Docker, подключаемся из другого проекта)

Если AMB развёрнут в Docker и доступен на `http://localhost:3333`, а вы работаете в другом репозитории (например, `cloudpbx-ui`), можно подключить MCP **через npm-пакет** (рекомендуется) или по пути к клону AMB. Ниже — пример для Cursor; в Codex, Claude Code и других MCP-клиентах конфиг задаётся аналогично (см. документацию клиента).

#### Через npm-пакет @bizmedia/amb-mcp (рекомендуется)

1. **В вашем проекте** установите пакет в dev-зависимости:
   ```bash
   pnpm add -D @bizmedia/amb-mcp
   ```

2. **Создайте или отредактируйте** `.cursor/mcp.json` в корне проекта:

   ```json
   {
     "mcpServers": {
       "message-bus": {
         "command": "pnpm",
         "args": ["exec", "amb-mcp"],
       "env": {
         "MESSAGE_BUS_URL": "http://localhost:3333",
         "MESSAGE_BUS_PROJECT_ID": "<PROJECT_ID>"
       }
       }
     }
   }
   ```

3. **Сиды агентов и тредов** — из корня проекта (должен быть файл `.cursor/agents/registry.json` и запущен AMB на 3333):
   ```bash
   pnpm exec amb-mcp seed agents
   pnpm exec amb-mcp seed threads
   pnpm exec amb-mcp seed all
   ```

   Переменная `MESSAGE_BUS_URL` берётся из окружения или из `.env` (пакет подтягивает dotenv).

#### Через путь к клону AMB

1. Соберите MCP в репозитории AMB: `cd /path/to/amb && pnpm mcp:build`.
2. В проекте в `.cursor/mcp.json` укажите:
   ```json
   {
     "mcpServers": {
       "message-bus": {
         "command": "node",
         "args": ["/path/to/amb/packages/mcp-server/dist/index.js"],
         "cwd": "/path/to/amb",
       "env": {
         "MESSAGE_BUS_URL": "http://localhost:3333",
         "MESSAGE_BUS_PROJECT_ID": "<PROJECT_ID>"
       }
       }
     }
   }
   ```

Перезапустите Cursor (или другой MCP-клиент) / перезагрузите MCP-серверы — в чате появятся инструменты `list_agents`, `send_message`, `get_inbox` и др.

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
packages/mcp-server/       # MCP-сервер и npm-пакет @openaisdk/amb-mcp (CLI: amb-mcp seed agents)
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
| `DATABASE_URL` | Строка подключения к PostgreSQL | `postgresql://postgres:postgres@localhost:5432/amb` |
| `PORT` | Порт сервера | `3333` |
| `MESSAGE_BUS_PROJECT_ID` | ID проекта для CLI/MCP/SDK запросов | `00000000-0000-0000-0000-000000000001` |

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
- [Migration Guide v1 -> vNext](docs/migration-guide-v1-vnext.md) — шаги миграции и breaking changes
- [Integration Examples](docs/integration-examples.md) — примеры для TypeScript/Python/curl и best practices
- [Architecture](docs/architecture.md) — архитектура системы
- [Changelog](CHANGELOG.md) — история изменений

## Участие в разработке

Мы приветствуем контрибуции. Подробнее: [CONTRIBUTING.md](CONTRIBUTING.md) (как сообщать об ошибках, процесс Pull Request, стандарты кода).

## Лицензия

MIT — см. файл [LICENSE](LICENSE).
