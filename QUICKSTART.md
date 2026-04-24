# Quickstart — Agent Message Bus (AMB)

Быстрый путь для использования AMB в своём проекте:

1. Поднять опубликованный AMB stack
2. Установить `@openaisdk/amb-mcp` в свой проект
3. Подключить MCP в Cursor, Codex или Claude Code
4. Зарегистрировать агентов из своего проекта
5. Дать задачу `orchestrator`
6. Наблюдать workflow в Dashboard

Полная версия этого onboarding находится в [README.md](README.md). Ниже короткая copy-paste версия.

## 1. Поднять AMB

```bash
curl -O https://raw.githubusercontent.com/bizmedia/amb/main/deploy/compose/amb-compose.yml
docker compose -f amb-compose.yml up -d
```

`amb-compose.yml` уже по умолчанию использует безопасные host-порты `4333 / 4334 / 5433`, поэтому этот запуск не конфликтует с локальной разработкой AMB на `3333 / 3334`.

Если эти порты тоже заняты, поднимите стек на других host-портах:

```bash
WEB_PORT=5333 API_PORT=5334 POSTGRES_PORT=5543 docker compose -f amb-compose.yml up -d
curl http://localhost:5334/api/health
```

Проверить, что API поднялся:

```bash
curl http://localhost:4334/api/health
```

Открыть:

- Dashboard: `http://localhost:4333`
- API health: `http://localhost:4334/api/health`

Учётная запись **не** создаётся автоматически: зарегистрируйтесь через **Sign up** в Dashboard (email и пароль по вашему выбору).

После входа:

1. **Создайте проект** в Dashboard (если ещё нет).
2. Откройте проект и скопируйте **Project ID**.

На «чистой» БД после миграций может оставаться только legacy default tenant/project из старых SQL-миграций — отдельного пользователя по умолчанию нет.

## 2. Установить MCP package в свой проект

```bash
pnpm add -D @openaisdk/amb-mcp
```

или:

```bash
npm install -D @openaisdk/amb-mcp
```

## 3. Подключить MCP

### Переменные окружения

| Переменная | Обязательно | Описание |
| ---------- | ------------- | -------- |
| `MESSAGE_BUS_URL` | да | Базовый URL **HTTP API** AMB (тот же хост/порт, что и `/api/health`). Для опубликованного compose по умолчанию это **`http://localhost:4334`**, а не порт Dashboard (4333). |
| `MESSAGE_BUS_PROJECT_ID` | да | UUID проекта из Dashboard. |
| `MESSAGE_BUS_ACCESS_TOKEN` | если API требует JWT | Токен доступа к проекту из Dashboard. Допустимо имя `MESSAGE_BUS_TOKEN`. |

`amb-mcp` подхватывает переменные в порядке: **окружение процесса** → **`.cursor/mcp.env`** → **`.env.local`** → **`.env`**. Скрипты репозитория (`pnpm seed:*`, примеры) дополнительно умеют читать legacy inline `env` из MCP-конфигов (см. `apps/web/scripts/message-bus-env.ts`).

### Cursor (рекомендуется: `.cursor/mcp.env`)

1. Скопируйте `.cursor/mcp.env.example` в **`.cursor/mcp.env`** (файл в `.gitignore`, в репозиторий не коммитится).
2. Заполните `MESSAGE_BUS_URL`, `MESSAGE_BUS_PROJECT_ID`, `MESSAGE_BUS_ACCESS_TOKEN`.
3. `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "envFile": ".cursor/mcp.env",
      "env": {
        "AMB_MCP_BOOTSTRAP_LOG": "1"
      }
    }
  }
}
```

При `npm`: `"command": "npx"`, `"args": ["amb-mcp"]`.

**Без файла (только для быстрого теста):** можно задать всё в `env` внутри `mcp.json`, но токен тогда легко случайно закоммитить — не рекомендуется.

Если меняли порты compose, в `MESSAGE_BUS_URL` укажите **API**-порт (как в `curl …/api/health`). Пример: `API_PORT=5334` → `MESSAGE_BUS_URL=http://localhost:5334`.

### Codex

`.codex/config.toml`:

```toml
[mcp_servers.message-bus]
command = "pnpm"
args = ["exec", "amb-mcp"]
```

При `npm`: `command = "npx"`, `args = ["amb-mcp"]`.

Секреты и URL держите в `.cursor/mcp.env` или в окружении, а не в `.codex/config.toml`.

### Claude Code

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:4334",
        "MESSAGE_BUS_PROJECT_ID": "<YOUR_PROJECT_ID>",
        "MESSAGE_BUS_ACCESS_TOKEN": "<токен из Dashboard>"
      }
    }
  }
}
```

При `npm`: `"command": "npx"`, `"args": ["amb-mcp"]`.

Замените `MESSAGE_BUS_PROJECT_ID` и токен на значения из Dashboard, перезапустите клиент.

## 4. Зарегистрировать агентов

Предпочтительный путь:

```bash
# или: npx amb-mcp setup
MESSAGE_BUS_URL=http://localhost:4334 \
MESSAGE_BUS_PROJECT_ID=<YOUR_PROJECT_ID> \
MESSAGE_BUS_ACCESS_TOKEN=<YOUR_PROJECT_TOKEN> \
pnpm exec amb-mcp setup
```

`setup` сам:

- ищет `.cursor/agents/registry.json`
- если файла нет, собирает агентов из `.cursor/agents/*.md` или `.agents/*.md`
- регистрирует агентов
- создаёт default threads

Ручной режим, если нужен полный контроль:

```bash
# или: npx amb-mcp seed all .cursor/agents
MESSAGE_BUS_URL=http://localhost:4334 \
MESSAGE_BUS_PROJECT_ID=<YOUR_PROJECT_ID> \
MESSAGE_BUS_ACCESS_TOKEN=<YOUR_PROJECT_TOKEN> \
pnpm exec amb-mcp seed all .cursor/agents
```

Минимальный набор ролей:

- `orchestrator`
- `po`
- `architect`
- `dev`
- `qa`

## 5. Запустить первый workflow

Отправьте `orchestrator` такой prompt:

```text
Create a thread in AMB called "project-onboarding". Coordinate work across po, architect, dev, and qa to review this repository, identify the first useful improvement, and summarize the result in the same thread.
```

## 6. Что должно получиться

В Dashboard вы должны увидеть:

- новый thread
- сообщения от `orchestrator` другим ролям
- ответы от `po`, `architect`, `dev`, `qa`
- финальную summary от `orchestrator`

## Частые проблемы

- `docker compose up` падает из-за занятых портов: по умолчанию `WEB_PORT=4333`, `API_PORT=4334`, `POSTGRES_PORT=5433`; при смене портов в `MESSAGE_BUS_URL` укажите **хост-порт API** (тот, что для `/api/health`), а не Dashboard.
- MCP не стартует в Cursor: есть ли файл `.cursor/mcp.env` и корректный `envFile` в `mcp.json`; после правок перезапустите MCP / окно Cursor.
- MCP не появился: проверьте, что пакет `@openaisdk/amb-mcp` установлен и клиент перезапущен.
- 401 / отказ API: задайте `MESSAGE_BUS_ACCESS_TOKEN` (или положите его в `.cursor/mcp.env`).
- Агенты не появились: проверьте `MESSAGE_BUS_PROJECT_ID` и путь `.cursor/agents` или `.agents`.
- `orchestrator` пишет, а остальные роли молчат: сначала проверьте single-client сценарий, потом переходите к cross-client setup.

## Как обновляются публичные артефакты

Публичные Docker-образы и пакет `@openaisdk/amb-mcp` публикуются из GitHub Actions после merge в `main`. Для использования AMB ориентируйтесь на опубликованный stack и npm-пакет, а не на локальный ручной publish.
