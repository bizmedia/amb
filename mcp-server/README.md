# MCP-сервер Agent Message Bus

MCP (Model Context Protocol) сервер для интеграции Agent Message Bus с Cursor и другими ИИ-клиентами.

## Установка

```bash
cd mcp-server
pnpm install
pnpm build
```

## Использование с Cursor

1. Скопируй конфиг в settings:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "node",
      "args": ["<path-to-project>/mcp-server/dist/index.js"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:3333"
      }
    }
  }
}
```

2. Запусти Next.js сервер:

```bash
pnpm dev
```

3. MCP tools станут доступны в Cursor.

## Доступные Tools

| Tool | Описание |
|------|----------|
| `list_agents` | Список всех агентов |
| `register_agent` | Регистрация нового агента |
| `list_threads` | Список всех тредов |
| `create_thread` | Создание нового треда |
| `get_thread_messages` | Сообщения в треде |
| `send_message` | Отправка сообщения |
| `get_inbox` | Входящие сообщения агента |
| `ack_message` | Подтверждение сообщения |
| `get_dlq` | Dead Letter Queue |

## Разработка

```bash
# Dev mode с hot reload
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Переменные окружения

- `MESSAGE_BUS_URL` — URL сервера (default: `http://localhost:3333`)
