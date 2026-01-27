# Agent Message Bus

Local multi-agent message bus for AI agent orchestration.

## Features

- Thread-based messaging between agents
- Inbox with ACK/retry/DLQ
- TypeScript SDK
- MCP Server integration
- Dashboard UI
- Orchestrator workflows

## Quick Start

### Option 1: Local Development (recommended)

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL (via Docker)
docker compose up -d postgres

# 3. Copy environment file
cp .env.example .env

# 4. Run database migrations
pnpm db:migrate

# 5. Seed agents
pnpm seed:agents

# 6. Start dev server
pnpm dev
```

Open [http://localhost:3333](http://localhost:3333)

### Option 2: Full Docker Setup

```bash
# Build and start PostgreSQL + Next.js app
docker compose up -d --build

# Run migrations
docker compose exec app pnpm db:migrate:deploy

# Seed data
docker compose exec app pnpm seed:agents
```

Open [http://localhost:3333](http://localhost:3333)

> **Note:** The MCP server runs locally via Cursor (stdio), not in Docker.

### Database Commands

```bash
pnpm db:migrate        # Create/apply migrations (dev)
pnpm db:migrate:deploy # Apply migrations (prod)
pnpm db:studio         # Open Prisma Studio GUI
pnpm reset-db          # Reset DB and re-seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm seed:agents` | Seed agents from registry |
| `pnpm seed:threads` | Seed default threads |
| `pnpm seed:all` | Seed agents + threads |
| `pnpm reset-db` | Reset database and re-seed |
| `pnpm worker:retry` | Run retry worker |
| `pnpm cleanup` | Clean old messages |
| `pnpm orchestrator` | Run orchestrator workflow |
| `pnpm mcp:build` | Build MCP server |

## API Documentation

See [docs/api.md](docs/api.md) for complete API reference with examples.

Quick reference:

- **Agents:** `GET /api/agents`, `POST /api/agents`, `GET /api/agents/search?q=`
- **Threads:** `GET /api/threads`, `POST /api/threads`, `GET /api/threads/:id`, `PATCH /api/threads/:id`, `DELETE /api/threads/:id`, `GET /api/threads/:id/messages`
- **Messages:** `POST /api/messages/send`, `GET /api/messages/inbox?agentId=`, `POST /api/messages/:id/ack`
- **DLQ:** `GET /api/dlq`, `POST /api/dlq/:id/retry`, `POST /api/dlq/retry-all`

## SDK Usage

```typescript
import { createClient } from "./lib/sdk";

const client = createClient("http://localhost:3333");

// Register agent
const agent = await client.registerAgent({
  name: "my-agent",
  role: "worker",
});

// Create thread
const thread = await client.createThread({ title: "Task" });

// Send message
await client.sendMessage({
  threadId: thread.id,
  fromAgentId: agent.id,
  payload: { text: "Hello" },
});

// Poll inbox
for await (const messages of client.pollInbox(agent.id)) {
  for (const msg of messages) {
    console.log(msg.payload);
    await client.ackMessage(msg.id);
  }
}
```

## MCP Integration

1. Build MCP server:
```bash
cd mcp-server && pnpm install && pnpm build
```

2. Add to Cursor settings:
```json
{
  "mcpServers": {
    "message-bus": {
      "command": "node",
      "args": ["<path>/mcp-server/dist/index.js"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:3333"
      }
    }
  }
}
```

Available MCP tools:
- `list_agents`, `register_agent`
- `list_threads`, `create_thread`, `get_thread`, `update_thread`, `close_thread`
- `get_thread_messages`, `send_message`
- `get_inbox`, `ack_message`
- `get_dlq`

## Using in Another Project

### Option 1: Docker Service (Recommended)

Run Message Bus as a standalone service and connect via HTTP:

```bash
# Start Message Bus
docker compose up -d

# Connect from your app
curl http://localhost:3333/api/agents
```

### Option 2: Copy SDK

Copy SDK files to your project for a typed client:

```bash
cp -r lib/sdk your-project/lib/message-bus-sdk
```

```typescript
import { createClient } from "./lib/message-bus-sdk";

const client = createClient("http://localhost:3333");
const agent = await client.registerAgent({ name: "my-service", role: "worker" });
```

### Option 3: MCP in Cursor

Add to your project's `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": { "MESSAGE_BUS_URL": "http://localhost:3333" }
    }
  }
}
```

See [docs/getting-started.md](docs/getting-started.md) for detailed integration guide.

## Project Structure

```
.cursor/
  agents/         # Agent system prompts
  mcp.json        # MCP config example
app/
  api/            # API routes
  page.tsx        # Dashboard
components/
  dashboard/      # UI components
  ui/             # shadcn components
lib/
  sdk/            # TypeScript SDK
  services/       # Business logic
  hooks/          # React hooks
mcp-server/       # MCP server
scripts/          # Automation scripts
examples/         # SDK examples
prisma/
  schema.prisma   # Database schema
```

## Agents

| Role | Description |
|------|-------------|
| `po` | Product Owner |
| `architect` | System Architect |
| `dev` | Developer |
| `qa` | QA Engineer |
| `devops` | DevOps Engineer |
| `sdk` | SDK Developer |
| `ux` | UX Designer |
| `orchestrator` | Workflow Orchestrator |

## Message Flow

```
Agent A                    Message Bus                    Agent B
   │                           │                            │
   │── sendMessage() ─────────>│                            │
   │                           │── store (pending) ────────>│
   │                           │                            │
   │                           │<── pollInbox() ────────────│
   │                           │── deliver ────────────────>│
   │                           │                            │
   │                           │<── ackMessage() ───────────│
   │                           │── mark (ack) ─────────────>│
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/messagebus` |
| `PORT` | Server port | `3333` |

See `.env.example` for full configuration.

## Troubleshooting

### Database connection refused

```bash
# Check if PostgreSQL is running
docker compose ps

# Restart PostgreSQL
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### Prisma client not generated

```bash
pnpm prisma generate
```

### Migration errors

```bash
# Reset database (WARNING: deletes all data)
pnpm reset-db

# Or manually
pnpm prisma migrate reset
```

### Port already in use

```bash
# Find process on port 3333
lsof -i :3333

# Kill process
kill -9 <PID>
```

### Docker cleanup

```bash
# Stop all containers
docker compose down

# Remove volumes (deletes data)
docker compose down -v

# Rebuild images
docker compose build --no-cache
```

## Documentation

- [Getting Started](docs/getting-started.md) - Quick start guide
- [API Reference](docs/api.md) - Complete API documentation
- [Architecture](docs/architecture.md) - System architecture overview

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.
