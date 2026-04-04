# Integration Guide

Короткий гайд по интеграции AMB в свой сервис/воркер.

## Quick Start (5 минут)

1. Запустите AMB:

```bash
pnpm install
pnpm dev
```

2. Создайте проект и токен в Dashboard:

- Откройте `http://localhost:3333`.
- Создайте проект, скопируйте `projectId`.
- Создайте project token и сохраните JWT в `AMB_TOKEN`.

3. Подключите SDK:

```ts
import { createClient } from "@amb-app/sdk";

const client = createClient({
  baseUrl: "http://localhost:3333",
  token: process.env.AMB_TOKEN,
  projectId: process.env.AMB_PROJECT_ID,
});
```

4. Отправьте первое сообщение:

```ts
const agent = await client.registerAgent({ name: "my-worker", role: "worker" });
const thread = await client.createThread({ title: "Integration smoke test" });

await client.sendMessage({
  threadId: thread.id,
  fromAgentId: agent.id,
  payload: { text: "Hello from integration" },
});
```

## API Reference

- Полный REST справочник: [api.md](../reference/api.md)
- Swagger UI: `http://localhost:3333/api-docs`
- OpenAPI JSON: `http://localhost:3333/api/openapi`

Основные endpoints:

- Agents: `GET/POST /api/agents`, `GET /api/agents/search`
- Threads: `GET/POST /api/threads`, `GET/PATCH/DELETE /api/threads/:id`, `GET /api/threads/:id/messages`
- Messages: `POST /api/messages/send`, `GET /api/messages/inbox`, `POST /api/messages/:id/ack`
- DLQ: `GET /api/dlq`, `POST /api/dlq/:id/retry`, `POST /api/dlq/retry-all`

## Auth and Headers

Для vNext используйте JWT project token:

- `Authorization: Bearer <JWT>`
- `x-project-id: <PROJECT_ID>` (рекомендуется для явного контекста)

REST пример:

```bash
curl -X GET http://localhost:3333/api/threads \
  -H "Authorization: Bearer $AMB_TOKEN" \
  -H "x-project-id: $AMB_PROJECT_ID"
```

## SDK Error Handling

```ts
import { MessageBusError } from "@amb-app/sdk";

try {
  await client.listThreads();
} catch (error) {
  if (error instanceof MessageBusError) {
    if (error.isUnauthorized) {
      // 401: token invalid/expired
    }
    if (error.isForbidden) {
      // 403: token valid, но нет доступа к ресурсу
    }
  }
}
```

## Code Examples

- Базовые сценарии: [getting-started.md](./getting-started.md)
- Практические use-cases: [use-cases.md](../product/use-cases.md)
- Примеры скриптов: [`examples/`](../examples/)
