# Integration Examples

Набор практических примеров интеграции AMB для разных стеков.

## TypeScript (SDK)

```ts
import { createClient, MessageBusError } from "@amb-app/sdk";

const client = createClient({
  baseUrl: "http://localhost:3334",
  token: process.env.AMB_TOKEN,
  projectId: process.env.AMB_PROJECT_ID,
});

const agent = await client.registerAgent({ name: "ts-worker", role: "worker" });
const thread = await client.createThread({ title: "TS integration" });

await client.sendMessage({
  threadId: thread.id,
  fromAgentId: agent.id,
  payload: { text: "Hello from TypeScript" },
});

try {
  const inbox = await client.getInbox(agent.id);
  for (const msg of inbox) {
    await client.ackMessage(msg.id);
  }
} catch (error) {
  if (error instanceof MessageBusError && error.isAuthError) {
    console.error("Auth failed: check token and project scope");
  }
}
```

## Python (requests)

```python
import os
import requests

BASE_URL = os.getenv("AMB_URL", "http://localhost:3334")
TOKEN = os.environ["AMB_TOKEN"]
PROJECT_ID = os.environ["AMB_PROJECT_ID"]

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "x-project-id": PROJECT_ID,
    "Content-Type": "application/json",
}

# List threads
threads = requests.get(f"{BASE_URL}/api/threads", headers=headers, timeout=10)
threads.raise_for_status()
print(threads.json())

# Create thread
created = requests.post(
    f"{BASE_URL}/api/threads",
    headers=headers,
    json={"title": "Python integration", "status": "open"},
    timeout=10,
)
created.raise_for_status()
print(created.json())
```

## Bash (curl)

```bash
AMB_URL=http://localhost:3334

curl -X GET "$AMB_URL/api/threads" \
  -H "Authorization: Bearer $AMB_TOKEN" \
  -H "x-project-id: $AMB_PROJECT_ID"
```

## Common Patterns

1. Request/Reply:
- `sendMessage` c `toAgentId` и ожидание ответа через `waitForResponse`.

2. Broadcast Notifications:
- `toAgentId: null` для рассылки всем агентам проекта.

3. Worker Loop:
- `pollInbox(agentId)` -> обработка -> `ackMessage`.

4. DLQ Recovery:
- периодический `getDLQ()` + `retryDLQMessage()` / `retryAllDLQ()`.

## Best Practices

1. Всегда передавайте JWT + `projectId` явно.
2. Логируйте `code/status/details` из `MessageBusError`.
3. Используйте idempotency на стороне обработчиков (возможны retry).
4. Разделяйте worker-агентов по ролям и отдельным thread-темам.
5. Для локального smoke-check используйте `docker compose up --build`.

## Related

- [integration-guide.md](./integration-guide.md)
- [migration-guide-v1-vnext.md](./migration-guide-v1-vnext.md)
- [api.md](../reference/api.md)
