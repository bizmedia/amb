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
WEB_PORT=4333 API_PORT=4334 POSTGRES_PORT=5433 docker compose -f amb-compose.yml up -d
```

Это безопасный default для быстрого старта на той же машине, где вы уже локально разрабатываете AMB на `3333/3334`.

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

Логин:

- email: `admin@local.test`
- password: `ChangeMe123!`

Published stack автоматически создаёт default user и `Default Project`.

После входа:

1. Откройте `Default Project` в Dashboard
2. Скопируйте `Project ID`

## 2. Установить MCP package в свой проект

```bash
pnpm add -D @openaisdk/amb-mcp
```

или:

```bash
npm install -D @openaisdk/amb-mcp
```

## 3. Подключить MCP

Общие значения:

- `MESSAGE_BUS_URL=http://localhost:4333`
- `MESSAGE_BUS_PROJECT_ID=<YOUR_PROJECT_ID>`

Если вы переопределили `WEB_PORT`, то `MESSAGE_BUS_URL` должен указывать на тот же порт.
Пример: `WEB_PORT=5333` => `MESSAGE_BUS_URL=http://localhost:5333`.

### Cursor

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:4333",
        "MESSAGE_BUS_PROJECT_ID": "22222222-2222-4222-8222-222222222222"
      }
    }
  }
}
```

Если проект использует `npm`, используйте:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "npx",
      "args": ["amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:4333",
        "MESSAGE_BUS_PROJECT_ID": "22222222-2222-4222-8222-222222222222"
      }
    }
  }
}
```

### Codex

`.codex/config.toml`:

```toml
[mcp_servers.message-bus]
command = "pnpm"
args = ["exec", "amb-mcp"]

[mcp_servers.message-bus.env]
MESSAGE_BUS_URL = "http://localhost:4333"
MESSAGE_BUS_PROJECT_ID = "22222222-2222-4222-8222-222222222222"
```

Если проект использует `npm`, используйте:

```toml
[mcp_servers.message-bus]
command = "npx"
args = ["amb-mcp"]

[mcp_servers.message-bus.env]
MESSAGE_BUS_URL = "http://localhost:4333"
MESSAGE_BUS_PROJECT_ID = "22222222-2222-4222-8222-222222222222"
```

### Claude Code

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:4333",
        "MESSAGE_BUS_PROJECT_ID": "22222222-2222-4222-8222-222222222222"
      }
    }
  }
}
```

Если проект использует `npm`, используйте:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "npx",
      "args": ["amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:4333",
        "MESSAGE_BUS_PROJECT_ID": "22222222-2222-4222-8222-222222222222"
      }
    }
  }
}
```

Замените `MESSAGE_BUS_PROJECT_ID` на ID проекта из Dashboard и перезапустите клиент.

## 4. Зарегистрировать агентов

Предпочтительный путь:

```bash
# или: npx amb-mcp setup
MESSAGE_BUS_URL=http://localhost:4333 \
MESSAGE_BUS_PROJECT_ID=<YOUR_PROJECT_ID> \
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
MESSAGE_BUS_URL=http://localhost:4333 \
MESSAGE_BUS_PROJECT_ID=<YOUR_PROJECT_ID> \
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

- `docker compose up` падает из-за занятых портов: published stack по умолчанию уже использует `WEB_PORT=4333 API_PORT=4334 POSTGRES_PORT=5433`; если и они заняты, выберите другой набор портов и используйте тот же `WEB_PORT` в `MESSAGE_BUS_URL`.
- MCP не появился: проверьте, что пакет `@openaisdk/amb-mcp` установлен и клиент перезапущен.
- Агенты не появились: проверьте `MESSAGE_BUS_PROJECT_ID` и путь `.cursor/agents` или `.agents`.
- `orchestrator` пишет, а остальные роли молчат: сначала проверьте single-client сценарий, потом переходите к cross-client setup.

## Как обновляются публичные артефакты

Публичные Docker-образы и пакет `@openaisdk/amb-mcp` публикуются из GitHub Actions после merge в `main`. Для использования AMB ориентируйтесь на опубликованный stack и npm-пакет, а не на локальный ручной publish.
