# Getting Started

Step-by-step guide for developers.

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start-5-minutes)
2. [Best Practices](#best-practices)
3. [Developer Cookbook](#developer-cookbook)

---

# Quick Start (5 minutes)

Get the system running and send your first message between agents.

## Step 1: Setup (2 min)

```bash
# Clone and install
git clone <repo-url> && cd mcp-message-bus
pnpm install

# Start PostgreSQL
docker compose up -d postgres

# Configure and start
cp .env.example .env
pnpm db:migrate
pnpm seed:agents
pnpm dev
```

**Verify:** Open http://localhost:3333 — you should see the Dashboard.

## Step 2: Create a Thread (1 min)

```bash
curl -X POST http://localhost:3333/api/threads \
  -H "Content-Type: application/json" \
  -d '{"title": "my-first-thread"}'
```

Response:
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "my-first-thread",
    "status": "open"
  }
}
```

Save the thread `id`.

## Step 3: Get Agent IDs (30 sec)

```bash
curl http://localhost:3333/api/agents | jq '.data[0:2]'
```

Response (example):
```json
{
  "data": [
    {"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Developer", "role": "dev"},
    {"id": "550e8400-e29b-41d4-a716-446655440002", "name": "QA Engineer", "role": "qa"}
  ]
}
```

Save the `id` values for `dev` and `qa` agents.

## Step 4: Send a Message (1 min)

```bash
curl -X POST http://localhost:3333/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "<thread-uuid>",
    "fromAgentId": "<dev-uuid>",
    "toAgentId": "<qa-uuid>",
    "payload": {"task": "Review this PR", "pr": 42}
  }'
```

## Step 5: Check Recipient Inbox (30 sec)

```bash
curl "http://localhost:3333/api/messages/inbox?agentId=<qa-uuid>"
```

You should see a message with status `pending`.

## Step 6: Acknowledge Receipt

```bash
curl -X POST http://localhost:3333/api/messages/<message-uuid>/ack
```

**Done!** You've sent and acknowledged your first message.

---

# Best Practices

Recommendations for effective use of Agent Message Bus.

## 1. Thread Structure

### ✅ One thread — one task

```
feature-auth-login     ← specific feature
bugfix-api-timeout     ← specific bug
release-v1.2.0         ← specific release
```

### ❌ Don't do this

```
general-discussion     ← too broad
dev-tasks              ← too abstract
```

### Thread Naming

| Task Type | Pattern | Example |
|-----------|---------|---------|
| Feature | `feature-<name>` | `feature-csv-export` |
| Bugfix | `bugfix-<description>` | `bugfix-login-timeout` |
| Release | `release-v<version>` | `release-v1.2.0` |
| Incident | `incident-<code>` | `incident-2026-01-27-db` |
| Review | `review-<type>-<id>` | `review-pr-142` |

## 2. Message Addressing

### Direct message → specific agent

```json
{
  "toAgentId": "550e8400-e29b-41d4-a716-446655440000",
  "payload": {"task": "Test endpoint /api/users"}
}
```

### Broadcast → all agents in thread

```json
{
  "toAgentId": null,
  "payload": {"announcement": "Release delayed by 1 hour"}
}
```

### @mentions in payload

```json
{
  "payload": {
    "text": "@dev fix the bug, @qa verify after fix",
    "mentions": ["dev", "qa"]
  }
}
```

## 3. Message Lifecycle

### Always acknowledge processing

```typescript
for await (const messages of client.pollInbox(agentId)) {
  for (const msg of messages) {
    try {
      await processMessage(msg);      // Process
      await client.ackMessage(msg.id); // ACK after success
    } catch (error) {
      console.error("Failed:", error);
      // Don't ACK — message will remain for retry
    }
  }
}
```

### Monitor DLQ

```bash
# Check periodically
curl http://localhost:3333/api/dlq

# If messages exist — investigate the cause
curl -X POST http://localhost:3333/api/dlq/<id>/retry
```

## 4. Payload Structure

### Use typed payloads

```typescript
interface TaskPayload {
  type: "task";
  action: string;
  data: Record<string, unknown>;
  priority?: "low" | "medium" | "high";
}

interface ResponsePayload {
  type: "response";
  parentMessageId: string;
  status: "success" | "error";
  result?: unknown;
  error?: string;
}
```

### Example: task → response

```json
// Task from orchestrator → dev
{
  "type": "task",
  "action": "implement-feature",
  "data": {"feature": "csv-export", "spec": "..."}
}

// Response from dev → orchestrator
{
  "type": "response",
  "parentMessageId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "result": {"files": ["lib/csv.ts", "app/api/export/route.ts"]}
}
```

## 5. Polling Strategies

### For interactive work

```typescript
// Fast polling for UI
client.pollInbox(agentId, { interval: 1000 }); // 1 sec
```

### For background workers

```typescript
// Efficient polling for workers
client.pollInbox(agentId, { interval: 5000 }); // 5 sec
```

### Graceful shutdown

```typescript
const controller = new AbortController();

process.on("SIGINT", () => controller.abort());
process.on("SIGTERM", () => controller.abort());

for await (const msgs of client.pollInbox(agentId, { 
  signal: controller.signal 
})) {
  // ...
}
```

## 6. Closing Threads

### Close completed threads

```bash
curl -X PATCH http://localhost:3333/api/threads/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "closed"}'
```

### Final message before closing

```json
{
  "payload": {
    "type": "thread_summary",
    "outcome": "success",
    "summary": "Feature implemented, tested, deployed",
    "participants": ["po", "architect", "dev", "qa", "devops"]
  }
}
```

---

# Developer Cookbook

Ready-to-use recipes for common tasks.

## Recipe 1: Register and Start Agent

```typescript
import { createClient } from "./lib/sdk";

const client = createClient("http://localhost:3333");

// Register with capabilities
const agent = await client.registerAgent({
  name: "my-custom-agent",
  role: "worker",
  capabilities: {
    languages: ["typescript", "python"],
    tools: ["eslint", "pytest"],
  },
});

console.log("Agent ID:", agent.id);
```

## Recipe 2: Send Task to Specific Agent

```typescript
// Find agent by role
const agents = await client.listAgents();
const devAgent = agents.find(a => a.role === "dev");

// Send task
await client.sendMessage({
  threadId: "550e8400-e29b-41d4-a716-446655440000",
  fromAgentId: myAgent.id,
  toAgentId: devAgent.id,
  payload: {
    type: "task",
    action: "fix-bug",
    data: {
      issue: "Login timeout after 30 seconds",
      file: "lib/auth.ts",
      line: 42,
    },
  },
});
```

## Recipe 3: Inbox Listener with Type Handling

```typescript
async function processMessage(msg: Message) {
  const payload = msg.payload as { type: string; [key: string]: unknown };

  switch (payload.type) {
    case "task":
      await handleTask(payload);
      break;
    case "question":
      await handleQuestion(payload);
      break;
    case "notification":
      console.log("Notification:", payload.text);
      break;
    default:
      console.warn("Unknown type:", payload.type);
  }
}

// Polling loop
for await (const messages of client.pollInbox(agentId)) {
  for (const msg of messages) {
    await processMessage(msg);
    await client.ackMessage(msg.id);
  }
}
```

## Recipe 4: Workflow with Sequential Steps

```typescript
interface Step {
  agent: string;
  task: string;
}

async function runWorkflow(threadTitle: string, steps: Step[]) {
  const thread = await client.createThread({ title: threadTitle });
  const agents = await client.listAgents();
  const byRole = new Map(agents.map(a => [a.role, a]));

  for (const step of steps) {
    const target = byRole.get(step.agent);
    if (!target) continue;

    await client.sendMessage({
      threadId: thread.id,
      fromAgentId: orchestratorId,
      toAgentId: target.id,
      payload: { type: "task", task: step.task },
    });

    // Optionally: wait for response
    // await waitForResponse(thread.id, target.id);
  }

  return thread;
}

// Usage
await runWorkflow("Deploy v1.2", [
  { agent: "dev", task: "Build release" },
  { agent: "qa", task: "Run smoke tests" },
  { agent: "devops", task: "Deploy to production" },
]);
```

## Recipe 5: Broadcast to All Agents

```typescript
await client.sendMessage({
  threadId: thread.id,
  fromAgentId: orchestrator.id,
  toAgentId: null,  // ← broadcast
  payload: {
    type: "announcement",
    priority: "high",
    text: "Deployment starts in 5 minutes. Don't merge to main!",
  },
});
```

## Recipe 6: Reply to Message (Threading)

```typescript
// Received message
const incomingMsg = inbox[0];

// Reply with parentId
await client.sendMessage({
  threadId: incomingMsg.threadId,
  fromAgentId: myAgent.id,
  toAgentId: incomingMsg.fromAgentId,
  parentId: incomingMsg.id,  // ← link to parent
  payload: {
    type: "response",
    status: "done",
    result: { /* ... */ },
  },
});
```

## Recipe 7: Retry from DLQ

```typescript
// Get all failed messages
const dlq = await client.getDLQ();

console.log(`In DLQ: ${dlq.length} messages`);

for (const msg of dlq) {
  console.log(`- ${msg.id}: ${msg.retryCount} attempts, from ${msg.fromAgentId}`);
}

// Retry specific message
if (dlq.length > 0) {
  await client.retryDLQMessage(dlq[0].id);
}

// Retry all
await client.retryAllDLQ();
```

## Recipe 8: Search Agents

```typescript
// By name or role
const results = await client.searchAgents("dev");
// Returns agents where name or role contains "dev"
```

## Recipe 9: Filter Threads by Status

```typescript
const allThreads = await client.listThreads();

const openThreads = allThreads.filter(t => t.status === "open");
const closedThreads = allThreads.filter(t => t.status === "closed");

console.log(`Open: ${openThreads.length}, Closed: ${closedThreads.length}`);
```

## Recipe 10: MCP from Cursor

After configuring `.cursor/mcp.json`:

```
# In Cursor chat:

"Create thread 'bugfix-api' and send task to dev agent:
 fix timeout in /api/users"

# AI will execute:
# 1. create_thread({ title: "bugfix-api" })
# 2. send_message({ threadId: ..., toAgentId: dev, payload: {...} })
```

---

## What's Next?

| Resource | Description |
|----------|-------------|
| [API Reference](api.md) | Complete API documentation |
| [Architecture](architecture.md) | System architecture overview |
| [examples/](../examples/) | Ready-to-use scripts |
| http://localhost:3333 | Dashboard UI |

---

*Documentation: January 2026*
