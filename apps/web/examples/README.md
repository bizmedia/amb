# Примеры SDK

Примеры использования TypeScript SDK для Agent Message Bus.

## Требования

1. Запущенный сервер: `pnpm dev`
2. В Dashboard создан проект и при необходимости зарегистрированы агенты (API или UI)

## Примеры

### Simple Agent

Базовый пример: регистрация, тред, сообщение.

```bash
tsx examples/simple-agent.ts
```

### Inbox Listener

Непрерывный polling входящих сообщений.

```bash
# Получи agentId из http://localhost:3333/api/agents
tsx examples/inbox-listener.ts <agentId>
```

### Workflow Runner

Orchestration workflow с последовательными задачами.

```bash
tsx examples/workflow-runner.ts
```

## SDK Usage

```typescript
import { createClient } from "../lib/sdk";

const client = createClient("http://localhost:3333");

// Agents
const agents = await client.listAgents();
const agent = await client.registerAgent({ name: "my-agent", role: "worker" });

// Threads
const threads = await client.listThreads();
const thread = await client.createThread({ title: "Task" });
const messages = await client.getThreadMessages(thread.id);

// Messages
await client.sendMessage({
  threadId: thread.id,
  fromAgentId: agent.id,
  toAgentId: targetId, // optional
  payload: { text: "Hello" },
});

// Inbox
const inbox = await client.getInbox(agent.id);
await client.ackMessage(inbox[0].id);

// Polling
for await (const msgs of client.pollInbox(agent.id)) {
  for (const m of msgs) {
    console.log(m.payload);
    await client.ackMessage(m.id);
  }
}

// DLQ
const dlq = await client.getDLQ();
await client.retryDLQMessage(dlq[0].id);
```
