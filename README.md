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
- **Монорепозиторий (Turborepo)** — **NestJS** (`apps/api`) для REST API, **Next.js** (`apps/web`) для Dashboard; общая БД PostgreSQL, Prisma в `packages/db`.
- **SDK + MCP** — TypeScript SDK и MCP-сервер для Cursor, Codex, Claude Code и других MCP-клиентов.
- **JWT (опционально в dev)** — глобальный guard: без заголовка `Authorization` запросы проходят, пока не задано `JWT_REQUIRED=true`. Для production-сценариев предусмотрены пользовательские и проектные токены.
- **Ориентация на разработку** — быстрый старт, seed агентов, примеры, сценарии оркестратора.

## Чем не является (пока)

- **Не облачный сервис** — вы запускаете его сами; публичного SaaS нет.
- **Не enterprise multi-tenant SaaS** — проекты в Dashboard есть, но нет модели изолированных тенантов и биллинга как у облачного multi-tenant продукта.
- **Не production-ready** — нет managed SaaS и SLA; ориентация на разработку и self-hosted. Лимиты запросов настраиваются (`RATE_LIMIT_*` в `apps/api/.env.example`).
- **Без i18n** — интерфейс и сообщения пока не локализованы.

Дорожная карта (vNext): hosted multi-tenant сервис, углублённый JWT/project scope, Dashboard (`apps/web`) по HTTP к выделенному API — см. [docs/product-vision.md](docs/product-vision.md) и [docs/backlog.md](docs/backlog.md).

## Возможности

- Обмен сообщениями между агентами в рамках тредов
- Inbox с ACK, retry и DLQ
- TypeScript SDK
- Интеграция с MCP-сервером (Cursor, Codex, Claude Code и др.)
- Dashboard UI
- Сценарии оркестратора

## Быстрый старт для разработчиков

Ниже — два рабочих пути. Код разделён на **`apps/api`** (NestJS, порт 3334) и **`apps/web`** (Next.js Dashboard и BFF-роуты к API, порт 3333). **Полный стек в контейнерах** не требует установленного Node/pnpm на машине (сборка и зависимости — внутри сервисов `docker compose`). **Гибрид** удобен, если вы правите `apps/api` и `apps/web` на хосте и хотите горячую перезагрузку.

Во всех командах `docker compose` можно заменить на **`podman compose`**, если используете [Podman](https://podman.io/) (нужен Podman 4+ и плагин Compose или `podman-compose` по инструкции дистрибутива).

### Полный стек в Docker или Podman

| Сервис Compose | Исходники / образ | Назначение | Порт на хосте (по умолчанию) |
|----------------|-------------------|------------|------------------------------|
| `postgres` | — | PostgreSQL | **5433** → 5432 в контейнере |
| `api` | `apps/api` | NestJS REST API | **3334** |
| `web` | `apps/web` (или образ `openaisdk/amb`) | Next.js Dashboard, BFF `/api/*` → Nest | **3333** |
| `seed` | скрипты в `apps/web` | Однократный сид (пользователь, проект, агенты) | — |

**Шаги**

1. Клонируйте репозиторий и перейдите в корень проекта.
2. Запустите сборку и стек (первый запуск долгий: `pnpm install` и сборка **`apps/api`** и **`apps/web`** в контейнерах):

   ```bash
   docker compose up --build
   ```

   Фоновый режим:

   ```bash
   docker compose up -d --build
   ```

   **Быстрее (только UI из Docker Hub):** заранее `docker pull docker.io/openaisdk/amb:latest`, затем `docker compose -f docker-compose.web-image.yml up -d` — **`apps/web` не собирается** в контейнере, **`apps/api` по-прежнему собирается из репозитория**, см. [QUICKSTART.md](QUICKSTART.md).

3. Дождитесь успешного завершения сервиса `seed` (создаётся тестовый пользователь и данные для Dashboard). Смотреть прогресс:

   ```bash
   docker compose logs -f seed
   ```

4. Проверьте доступность:
   - Dashboard: [http://localhost:3333](http://localhost:3333)
   - API health: `curl -s http://localhost:3334/api/health`

**Порты заняты** — задайте переменные перед запуском:

```bash
API_PORT=4334 WEB_PORT=4333 docker compose up --build
```

**Остановка и сброс данных БД**

```bash
docker compose down          # остановить контейнеры
docker compose down -v       # + удалить том PostgreSQL
```

> **Важно:** MCP-сервер не входит в `docker compose`: его запускает ваш MCP-клиент (Cursor, Codex, Claude Code и т.д.) на хосте. `MESSAGE_BUS_URL` указывайте на **`apps/web`** (по умолчанию `http://localhost:3333` — BFF к **`apps/api`**; при смене порта — `WEB_PORT`).

### Гибрид: только PostgreSQL в контейнере, код на хосте

Удобно для ежедневной разработки с `pnpm dev`.

1. Установите на хосте **Node 20** и **pnpm** (версия зафиксирована в `package.json` → `packageManager`).

2. Поднимите БД:

   ```bash
   docker compose up -d postgres
   ```

3. Создайте файлы окружения из примеров (в корне репозитория нет единого `.env`):

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   В шаблонах уже указан порт **5433** для Postgres из `docker-compose.yml`. Если БД у вас на стандартном `5432`, поправьте `DATABASE_URL` в обоих `.env`.

4. Установите зависимости и миграции:

   ```bash
   pnpm install
   pnpm db:migrate
   ```

5. Запустите API и веб в dev-режиме:

   ```bash
   pnpm dev
   ```

6. Откройте [http://localhost:3333](http://localhost:3333) и при необходимости засейте агентов (нужен запущенный сервер):

   ```bash
   pnpm seed:agents
   ```

### Команды для работы с БД

```bash
pnpm db:migrate        # Создать/применить миграции (dev)
pnpm db:migrate:deploy # Применить миграции (prod / CI)
pnpm db:studio         # Открыть Prisma Studio (GUI)

# Prisma напрямую (из корня монорепо)
pnpm --filter @amb-app/db exec prisma generate
pnpm --filter @amb-app/db exec prisma migrate reset  # ВНИМАНИЕ: сбрасывает данные
```

## Скрипты

| Команда | Описание |
|---------|----------|
| `pnpm dev` | Запустить dev: Next.js (3333) и Nest API параллельно |
| `pnpm dev:api` | Только API в dev-режиме |
| `pnpm build` | Сборка пакетов через Turbo |
| `pnpm seed:agents` | Засеять агентов из реестра |
| `pnpm seed:threads` | Засеять треды по умолчанию |
| `pnpm seed:all` | Засеять агентов и треды |
| `pnpm orchestrator` | Запустить сценарий оркестратора |
| `pnpm agent:worker` | Воркер агентов (опрос inbox) |
| `pnpm mcp:build` | Собрать MCP-пакет `@openaisdk/amb-mcp` |

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

4. Соберите MCP-сервер из корня репозитория:

```bash
pnpm install && pnpm mcp:build
```

5. Добавьте в настройки Cursor (путь к `dist` замените на абсолютный путь к вашему клону):

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

#### Через npm-пакет (рекомендуется для стороннего репозитория)

Имя пакета на npm см. в [`packages/mcp-server/package.json`](packages/mcp-server/package.json) (поле `name`; бинарь в PATH — `amb-mcp`).

1. **В вашем проекте** установите пакет в dev-зависимости, например:
   ```bash
   pnpm add -D @openaisdk/amb-mcp
   ```
   *(если в реестре опубликовано другое имя — используйте его.)*

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
apps/
  api/                 # NestJS — REST API
  web/                 # Next.js — Dashboard, скрипты seed/examples
packages/
  db/                  # Prisma (schema, миграции, клиент)
  sdk/                 # Пакет @amb-app/sdk
  mcp-server/          # MCP + CLI amb-mcp (имя пакета: @openaisdk/amb-mcp)
  shared/, core/       # Общий код
.cursor/
  agents/              # Промпты агентов, registry.json
  mcp.json             # Пример конфига MCP
docker-compose.yml     # Локальный стек postgres + api + web + seed
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
| `DATABASE_URL` | Строка подключения к PostgreSQL | см. `apps/api/.env.example` и `apps/web/.env.example` (с Postgres из **docker compose** на хосте — порт **5433**) |
| `PORT` | Порт процесса | у API в compose — **3334**, у web — **3333** |
| `JWT_SECRET` | Подпись JWT | обязателен для валидации токенов; в compose задан для локального запуска |
| `JWT_REQUIRED` | Если `true` — без `Authorization: Bearer` ответ 401 | по умолчанию выключено (удобно для локальной разработки) |
| `MESSAGE_BUS_PROJECT_ID` | ID проекта для CLI/MCP/SDK | задаётся после создания проекта в Dashboard |

Шаблоны переменных: `apps/api/.env.example`, `apps/web/.env.example`.

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
pnpm --filter @amb-app/db exec prisma generate
```

### Ошибки миграций

```bash
# Сбросить БД (ВНИМАНИЕ: удаляет все данные)
pnpm --filter @amb-app/db exec prisma migrate reset
```

### Порт уже занят

```bash
# Найти процесс на порту (web по умолчанию 3333, API — 3334)
lsof -i :3333
lsof -i :3334

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
