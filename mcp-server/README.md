# @bizmedia/amb-mcp

MCP-сервер и CLI для [Agent Message Bus](https://github.com/bizmedia/amb). Даёт возможность из любого проекта подключаться к AMB (в т.ч. развёрнутому в Docker) через Cursor и запускать сиды из локального `.cursor/agents/registry.json`.

## Установка

```bash
pnpm add -D @bizmedia/amb-mcp
```

## Использование

### MCP в Cursor

В `.cursor/mcp.json` вашего проекта:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "env": { "MESSAGE_BUS_URL": "http://localhost:3333" }
    }
  }
}
```

### CLI: сиды агентов и тредов

Из корня проекта (по умолчанию читается `.cursor/agents/registry.json`; нужен запущенный AMB на `MESSAGE_BUS_URL`):

```bash
pnpm exec amb-mcp seed agents              # из .cursor/agents/registry.json
pnpm exec amb-mcp seed threads
pnpm exec amb-mcp seed all
```

**Указание пути к registry (файл или папка):**

```bash
pnpm exec amb-mcp seed agents .cursor/agents           # папка → ищется registry.json внутри
pnpm exec amb-mcp seed agents ./config/registry.json   # явный файл
pnpm exec amb-mcp seed agents -r /path/to/agents       # через опцию --registry / -r
pnpm exec amb-mcp seed all .cursor/agents
```

Если путь — каталог, используется `registry.json` внутри него.

Переменная окружения `MESSAGE_BUS_URL` (по умолчанию `http://localhost:3333`). Поддерживается `.env`.

## Публикация

Пакет собирается из этого каталога. Публикация в npm из корня репозитория:

```bash
cd mcp-server && pnpm build && npm publish --access public
```

(Или через CI при теге/релизе.)
