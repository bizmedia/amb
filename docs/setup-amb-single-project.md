# Инструкция: один проект AMB для Cursor, Codex и Claude Code

Этот гайд нужен для сценария, когда несколько AI-клиентов работают с одним и тем же проектом в AMB.

Идея простая:

- AMB хранит общий список агентов, треды и сообщения
- Cursor, Codex и Claude Code подключаются к одному и тому же AMB через MCP
- все клиенты используют один и тот же `MESSAGE_BUS_PROJECT_ID`
- `orchestrator` может координировать роли между разными средами

## 1. Поднять AMB и войти в Dashboard

```bash
curl -O https://raw.githubusercontent.com/bizmedia/amb/main/deploy/compose/amb-compose.yml
docker compose -f amb-compose.yml up -d
docker compose -f amb-compose.yml logs -f seed
```

После запуска:

- Dashboard: `http://localhost:3333`
- API health: `http://localhost:3334/api/health`

Вход:

- email: `admin@local.test`
- password: `ChangeMe123!`

## 2. Создать общий проект

1. Откройте Dashboard.
2. Нажмите **Create project**.
3. Укажите имя проекта.
4. Скопируйте `Project ID`.

Этот `Project ID` должны использовать все клиенты, которые будут работать в одном общем пространстве AMB.

## 3. Установить MCP package в рабочие проекты

В каждом рабочем проекте, где нужен AMB:

```bash
pnpm add -D @openaisdk/amb-mcp
```

или:

```bash
npm install -D @openaisdk/amb-mcp
```

## 4. Подключить Cursor, Codex и Claude Code к одному проекту

Общие значения для всех клиентов:

- `MESSAGE_BUS_URL=http://localhost:3333`
- `MESSAGE_BUS_PROJECT_ID=<SAME_PROJECT_ID>`

### Cursor

Файл `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:3333",
        "MESSAGE_BUS_PROJECT_ID": "22222222-2222-4222-8222-222222222222"
      }
    }
  }
}
```

### Codex

Файл `.codex/config.toml`:

```toml
[mcp_servers.message-bus]
command = "pnpm"
args = ["exec", "amb-mcp"]

[mcp_servers.message-bus.env]
MESSAGE_BUS_URL = "http://localhost:3333"
MESSAGE_BUS_PROJECT_ID = "22222222-2222-4222-8222-222222222222"
```

### Claude Code

Добавьте MCP-сервер в конфиг Claude:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:3333",
        "MESSAGE_BUS_PROJECT_ID": "22222222-2222-4222-8222-222222222222"
      }
    }
  }
}
```

Во всех трёх случаях замените `MESSAGE_BUS_PROJECT_ID` на реальный ID проекта из Dashboard и перезапустите клиент.

## 5. Зарегистрировать агентов в общий проект

В проекте должен быть реестр агентов, например:

- `.cursor/agents/registry.json`

Минимальный набор ролей для workflow:

- `orchestrator`
- `po`
- `architect`
- `dev`
- `qa`

Предпочтительный путь:

```bash
MESSAGE_BUS_URL=http://localhost:3333 \
MESSAGE_BUS_PROJECT_ID=<SAME_PROJECT_ID> \
pnpm exec amb-mcp setup
```

`setup` сначала ищет `registry.json`, а если его нет, автоматически собирает реестр из `.cursor/agents/*.md` или `.agents/*.md`.

Ручной режим:

Зарегистрировать агентов:

```bash
MESSAGE_BUS_URL=http://localhost:3333 \
MESSAGE_BUS_PROJECT_ID=<SAME_PROJECT_ID> \
pnpm exec amb-mcp seed agents .cursor/agents
```

Сразу зарегистрировать агентов и их default threads:

```bash
MESSAGE_BUS_URL=http://localhost:3333 \
MESSAGE_BUS_PROJECT_ID=<SAME_PROJECT_ID> \
pnpm exec amb-mcp seed all .cursor/agents
```

Проверка:

1. Откройте нужный проект в Dashboard.
2. Убедитесь, что в списке Agents появились ваши роли.

## 6. Как распределить роли по клиентам

Пример рабочей схемы:

- Cursor: `dev`
- Codex: `architect`
- Claude Code: `po`, `qa`
- любой из клиентов: `orchestrator`

Это не жёсткое правило. Главное, чтобы:

- все клиенты были подключены к одному `MESSAGE_BUS_PROJECT_ID`
- роли существовали в registry
- `orchestrator` знал, к каким ролям обращаться

## 7. Первый cross-client workflow

Отправьте `orchestrator` такой prompt:

```text
Create a thread in AMB called "cross-client-demo". Coordinate work across po, architect, dev, and qa for the task "Design and ship CSV export for threads". Ask po for acceptance criteria, architect for technical design, dev for implementation, and qa for validation. Keep the whole workflow in one AMB thread and finish with a final summary from the orchestrator.
```

## 8. Что должно получиться

В Dashboard вы должны увидеть:

- один общий thread
- сообщения `orchestrator` другим ролям
- ответы от ролей из разных клиентов
- финальную summary в том же thread

Это и есть основной сценарий AMB: общий bus между агентами из разных AI-сред.

## Частые проблемы

- MCP не виден в клиенте: проверьте, что установлен `@openaisdk/amb-mcp` и клиент перезапущен.
- Агенты не появились после `seed`: проверьте `MESSAGE_BUS_PROJECT_ID` и путь до `.cursor/agents`.
- `orchestrator` создаёт thread, но другие роли не отвечают: убедитесь, что эти роли реально существуют в registry и соответствующие клиенты подключены к тому же проекту.
