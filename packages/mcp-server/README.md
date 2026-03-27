# `@openaisdk/amb-mcp`

**Scope:** `Integration (MCP bridge)`

MCP server + CLI bridge для Agent Message Bus.

## Назначение

- Публикует операции AMB как MCP tools для Cursor/Codex/Claude Code.
- Позволяет агентам работать с задачами, агентами, тредами и сообщениями через единый протокол MCP.
- Даёт CLI-команды для seed из `.cursor/agents/registry.json`.

## Почему это отдельный пакет

- Это интеграционный слой с собственным lifecycle и способом запуска (stdio MCP server).
- Имеет отдельный канал дистрибуции (`npm` пакет + bin `amb-mcp`).
- Может развиваться независимо от `apps/web`/`apps/api`.

## Потребители

- MCP-клиенты: Cursor, Codex, Claude Code.
- Разработчики, выполняющие seed-операции.
- CI/automation сценарии с headless запуском.

## Публичный API

- CLI bin: `amb-mcp`.
- Server mode: `amb-mcp` или `amb-mcp server`.
- Setup command:
- `amb-mcp setup [path]`
- Seed commands:
- `amb-mcp seed agents [path]`
- `amb-mcp seed threads [path]`
- `amb-mcp seed all [path]`
- MCP tools по доменам: `tasks`, `agents`, `threads`, `messaging`.

## Конфигурация

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

## Переменные окружения

- `MESSAGE_BUS_URL` (default: `http://localhost:3333`)
- `MESSAGE_BUS_PROJECT_ID` (обязателен для `setup`, рекомендуется для `seed`)

## Границы и правила зависимостей

- Это adapter между MCP-протоколом и API клиента AMB.
- В пакете не должно быть бизнес-логики домена (она живёт в API/core).
- Новые инструменты добавлять через domain registry (`src/tools/*`, `build-registry.ts`).

## Локальная разработка

```bash
pnpm exec amb-mcp setup
pnpm --filter @openaisdk/amb-mcp run build
pnpm --filter @openaisdk/amb-mcp run dev
pnpm --filter @openaisdk/amb-mcp run seed:agents
```

## Ограничения

- Требует доступного AMB API и корректного project scope.
- Долгие операции должны обрабатываться на стороне API, не в MCP-tool handler.

## Статус

`public package`, `active`.
