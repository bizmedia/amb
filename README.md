[![Build Status](https://drone.megaretro.ru/api/badges/MegaRetroHQ/amb/status.svg)](https://drone.megaretro.ru/MegaRetroHQ/amb)

# Agent Message Bus (AMB)

AMB is a shared message bus for AI agents working in Cursor, Codex, Claude Code, or custom workers. It gives them one shared workflow layer: threads, inbox, ACK, retry, and DLQ.

Use AMB when you want one agent to delegate work to other agents and keep the whole workflow visible in one Dashboard instead of splitting it across separate IDE chats.

![Dashboard](docs/screen.png)

## Use AMB in Your Project in 5 Minutes

This is the fastest way to try AMB in your own repository:

1. Start the published AMB stack from Docker Hub
2. Install the published MCP package in your project
3. Connect your AI client to AMB
4. Register your agents
5. Ask the `orchestrator` to run a workflow
6. Watch the workflow in the Dashboard

## Prerequisites

Before you start, make sure you have:

- Docker or Podman with Compose support
- Node.js 20+ in your own project
- `pnpm` if your project uses `pnpm`, or `npm` if your project uses `npm`
- an AI client that supports MCP, such as Cursor, Codex, or Claude Code
- a project that contains either `.cursor/agents/registry.json` or agent markdown files in `.cursor/agents/*.md` or `.agents/*.md`

For the first run, you do not need to clone the AMB repository. The quick start below uses the published AMB stack and the published `@openaisdk/amb-mcp` package.

## Quick Start

Download and start the published AMB stack:

```bash
curl -O https://raw.githubusercontent.com/bizmedia/amb/main/deploy/compose/amb-compose.yml
docker compose -f amb-compose.yml up -d
```

`amb-compose.yml` already defaults to safe host ports `4333 / 4334 / 5433`, so this does not collide with local AMB development on `3333 / 3334`.

If those ports are also in use, override them when starting the stack:

```bash
WEB_PORT=5333 API_PORT=5334 POSTGRES_PORT=5543 docker compose -f amb-compose.yml up -d
curl http://localhost:5334/api/health
```

Wait until the API becomes healthy:

```bash
curl http://localhost:4334/api/health
```

Open:

- Dashboard: `http://localhost:4333`
- API health: `http://localhost:4334/api/health`

No default user is created: **sign up** in the Dashboard with your own email and password.

Then:

1. **Create a project** in the Dashboard if you do not have one yet
2. Open it and copy its **Project ID**

With `AMB_BOOTSTRAP=true`, only the default **tenant** row is ensured (no default user). A legacy **Default Project** may still exist on fresh databases from older migrations.

Install the MCP package in your own project:

```bash
pnpm add -D @openaisdk/amb-mcp
```

You can use `npm install -D @openaisdk/amb-mcp` if your project uses npm.

All examples below use `pnpm`. If your project uses `npm`, replace:

- `pnpm exec amb-mcp` with `npx amb-mcp`
- `"command": "pnpm", "args": ["exec", "amb-mcp"]` with `"command": "npx", "args": ["amb-mcp"]`

## Public Releases

Published Docker images and the `@openaisdk/amb-mcp` package are released from GitHub Actions after changes land in `main`.

If you consume AMB as a published stack, use the Docker Hub images referenced by [`deploy/compose/amb-compose.yml`](/Users/anatolijtukov/Developer/amb-app/deploy/compose/amb-compose.yml) and the published npm package. Local developer machines are no longer the primary release path.

## What AMB Adds to Your Project

If you are new to multi-agent systems, think of an agent as a role with a clear responsibility and its own prompt.

Examples:

- `po` defines scope and acceptance criteria
- `architect` proposes technical design
- `dev` implements changes
- `qa` validates behavior and edge cases
- `orchestrator` coordinates the workflow and keeps it in one thread

AMB does not replace your AI client. Your AI client runs the prompts. AMB stores agent identities and routes messages between them through:

- threads for one task or workflow
- inbox for incoming work
- ACK for delivery confirmation
- retry and DLQ for failed delivery

## Connect MCP

All clients should point to the same local AMB instance and the same `Project ID`.

### Environment variables

| Variable                   | Required                   | Description                                                                                                                                                                                               |
| -------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MESSAGE_BUS_URL`          | Yes                        | Base URL of the **AMB HTTP API** (the same origin that serves `/api/health`). Default published compose maps the API to host port **4334** (see `API_PORT` in `amb-compose.yml`), not the Dashboard port. |
| `MESSAGE_BUS_PROJECT_ID`   | Yes                        | Project UUID from the Dashboard.                                                                                                                                                                          |
| `MESSAGE_BUS_ACCESS_TOKEN` | When your API enforces JWT | Project access token from the Dashboard. You can use `MESSAGE_BUS_TOKEN` instead; the MCP server accepts either name.                                                                                     |

`amb-mcp` resolves variables in this order: **process environment** → **`.cursor/mcp.env`** → **`.env.local`** → **`.env`**. Repository scripts (`pnpm seed:*`, `pnpm example:*`, and similar) also support legacy inline config lookup from MCP config files as documented in `apps/web/scripts/message-bus-env.ts`.

### Cursor

**Recommended:** keep secrets out of Git using a gitignored `.cursor/mcp.env` file. `amb-mcp` loads it automatically from the project root, so no `envFile` or shell wrapper is required.

1. Copy `.cursor/mcp.env.example` to `.cursor/mcp.env` (`.cursor/mcp.env` is listed in `.gitignore`).
2. Set `MESSAGE_BUS_URL`, `MESSAGE_BUS_PROJECT_ID`, and `MESSAGE_BUS_ACCESS_TOKEN` in `.cursor/mcp.env`.
3. Create `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "env": {
        "AMB_MCP_BOOTSTRAP_LOG": "1"
      }
    }
  }
}
```

If your project uses `npm`, use `"command": "npx"` and `"args": ["amb-mcp"]` instead of `pnpm` / `pnpm exec`.

**Alternative (inline env, not recommended for tokens):** you can put variables directly under `env` for a quick test; avoid committing real tokens.

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:4334",
        "MESSAGE_BUS_PROJECT_ID": "<YOUR_PROJECT_ID>",
        "MESSAGE_BUS_ACCESS_TOKEN": "<paste token from Dashboard>"
      }
    }
  }
}
```

If you override compose ports, point `MESSAGE_BUS_URL` at the **API** host port (the one you use for `/api/health`). Example:

- `API_PORT=5334` => `MESSAGE_BUS_URL=http://localhost:5334`

### Codex

Create `.codex/config.toml` in your project:

```toml
[mcp_servers.message-bus]
command = "pnpm"
args = ["exec", "amb-mcp"]
```

If your project uses `npm`, use:

```toml
[mcp_servers.message-bus]
command = "npx"
args = ["amb-mcp"]
```

Then keep `MESSAGE_BUS_URL`, `MESSAGE_BUS_PROJECT_ID`, and `MESSAGE_BUS_ACCESS_TOKEN` in `.cursor/mcp.env` (recommended), `.env.local`, `.env`, or your shell environment.

### Claude Code

Add the same server to your Claude MCP config:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:4334",
        "MESSAGE_BUS_PROJECT_ID": "<YOUR_PROJECT_ID>",
        "MESSAGE_BUS_ACCESS_TOKEN": "<paste token from Dashboard>"
      }
    }
  }
}
```

If your project uses `npm`, use:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "npx",
      "args": ["amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:4334",
        "MESSAGE_BUS_PROJECT_ID": "<YOUR_PROJECT_ID>",
        "MESSAGE_BUS_ACCESS_TOKEN": "<paste token from Dashboard>"
      }
    }
  }
}
```

Replace `MESSAGE_BUS_PROJECT_ID` and the access token with values from your Dashboard, then restart your client.

## Efficient MCP Usage

The MCP package is optimized for low token usage:

- heavy list/read tools return summary objects by default
- `limit` defaults to `20`
- full payloads are opt-in with `summary=false`

Recommended usage pattern:

1. Use small list calls first
2. Inspect one thread, task, or inbox in detail only when needed
3. Ask for full payloads only for targeted debugging

Examples:

```json
{
  "agentId": "550e8400-e29b-41d4-a716-446655440000",
  "limit": 10
}
```

```json
{
  "threadId": "550e8400-e29b-41d4-a716-446655440000",
  "limit": 50,
  "summary": false
}
```

## Register Your Agents

AMB needs a registry of the agents that exist in your project.

If your project already has a registry like `.cursor/agents/registry.json`, you can register those agents directly into AMB.

Example registry structure:

```json
{
  "agents": [
    {
      "id": "orchestrator",
      "name": "Workflow Orchestrator",
      "role": "orchestrator",
      "systemPromptFile": ".cursor/agents/orchestrator.md"
    },
    {
      "id": "dev",
      "name": "Developer",
      "role": "dev",
      "systemPromptFile": ".cursor/agents/dev.md"
    }
  ]
}
```

Recommended minimum set:

- `orchestrator`
- `po`
- `architect`
- `dev`
- `qa`

Recommended first run:

```bash
# or: npx amb-mcp setup
MESSAGE_BUS_URL=http://localhost:4334 \
MESSAGE_BUS_PROJECT_ID=<YOUR_PROJECT_ID> \
MESSAGE_BUS_ACCESS_TOKEN=<YOUR_PROJECT_TOKEN> \
pnpm exec amb-mcp setup
```

`setup` is the 3-minute path. It looks for `.cursor/agents/registry.json`, falls back to markdown agent files in `.cursor/agents` or `.agents`, registers agents, and creates default threads.

You do not need `registry.json` for the first run. If your project only has agent markdown files, `setup` can infer agents automatically.

Example:

```text
.cursor/agents/orchestrator.md
.cursor/agents/po.md
.cursor/agents/architect.md
.cursor/agents/dev.md
.cursor/agents/qa.md
```

In that case, `setup` will:

- create `registry.json` automatically
- register those agents in AMB
- create their default threads
- tell you to open the Dashboard and verify the result

Manual commands if you want more control:

Register agents from your project:

```bash
# or: npx amb-mcp seed agents .cursor/agents
MESSAGE_BUS_URL=http://localhost:4334 \
MESSAGE_BUS_PROJECT_ID=<YOUR_PROJECT_ID> \
MESSAGE_BUS_ACCESS_TOKEN=<YOUR_PROJECT_TOKEN> \
pnpm exec amb-mcp seed agents .cursor/agents
```

Register agents and default threads:

```bash
# or: npx amb-mcp seed all .cursor/agents
MESSAGE_BUS_URL=http://localhost:4334 \
MESSAGE_BUS_PROJECT_ID=<YOUR_PROJECT_ID> \
MESSAGE_BUS_ACCESS_TOKEN=<YOUR_PROJECT_TOKEN> \
pnpm exec amb-mcp seed all .cursor/agents
```

After that, open the Dashboard and confirm that the agents appear in the selected project.

## First Workflow

Send this prompt to your `orchestrator`:

```text
Create a thread in AMB called "project-onboarding". Coordinate work across po, architect, dev, and qa to review this repository, identify the first useful improvement, and summarize the result in the same thread.
```

## What You Should See

In the Dashboard you should see:

- a new thread created by the `orchestrator`
- messages sent to other roles
- replies from `po`, `architect`, `dev`, and `qa`
- a final summary posted by the `orchestrator`

This is the main value of AMB: one shared workflow across multiple agents instead of isolated chats.

## Cross-Client Setup

AMB becomes much more useful when different roles live in different tools but share one bus.

Example setup:

- Cursor: `dev`
- Codex: `architect`
- Claude Code: `po`, `qa`
- any client: `orchestrator`

To make this work:

1. Connect all clients to the same `MESSAGE_BUS_URL` (API base URL) and, when required, the same `MESSAGE_BUS_ACCESS_TOKEN`
2. Use the same `MESSAGE_BUS_PROJECT_ID` everywhere
3. Register the same agent set into that project
4. Ask the `orchestrator` to coordinate across those roles

Example cross-client prompt:

```text
Create a thread in AMB called "cross-client-demo". Coordinate work across po, architect, dev, and qa for the task "Design and ship CSV export for threads". Ask po for acceptance criteria, architect for technical design, dev for implementation, and qa for validation. Keep the whole workflow in one AMB thread and finish with a final summary from the orchestrator.
```

## Troubleshooting

### Shared host with mega-retro and saas-billing

If all sites run on one server behind a single host Caddy, keep fixed non-overlapping upstream ports:

- mega-retro: `8080` (landing), `3000` (web), `4000` (api)
- saas-billing: `3101` (admin-ui), `4101` (api), `9190` (worker metrics)
- amb-app: `3201` (web), `4201` (api), `9290` (reserved metrics)

For AMB on a shared host use:

```bash
docker compose -f deploy/compose/docker-compose.shared-host.yml up -d
```

Then route domains in host Caddy:

- `amb.megaretro.ru` -> `127.0.0.1:3201`
- `api.amb.megaretro.ru` -> `127.0.0.1:4201`

### `docker compose up` fails because a port is already in use

Start the published stack on different host ports:

```bash
WEB_PORT=5333 API_PORT=5334 POSTGRES_PORT=5543 docker compose -f amb-compose.yml up -d
```

Then point `MESSAGE_BUS_URL` at the **API** port you chose:

- `API_PORT=5334` => `MESSAGE_BUS_URL=http://localhost:5334`

### MCP is connected but tools do not appear

Check that:

- `@openaisdk/amb-mcp` is installed in your project
- your MCP config uses `pnpm exec amb-mcp` or `npx amb-mcp`
- you restarted Cursor, Codex, or Claude Code after editing the config
- `MESSAGE_BUS_PROJECT_ID` points to the project you created in the Dashboard
- `MESSAGE_BUS_ACCESS_TOKEN` is set (in `.cursor/mcp.env` or inline `env`) if API calls return 401
- for Cursor with `envFile`, the path resolves and `.cursor/mcp.env` exists on disk

### `seed agents` succeeded but agents do not appear in the Dashboard

Usually this means:

- you seeded another project
- your registry path is wrong
- the Dashboard is open on another project

Run the command again and verify the selected project in the UI:

```bash
# or: npx amb-mcp seed agents .cursor/agents
MESSAGE_BUS_URL=http://localhost:4334 \
MESSAGE_BUS_PROJECT_ID=<YOUR_PROJECT_ID> \
MESSAGE_BUS_ACCESS_TOKEN=<YOUR_PROJECT_TOKEN> \
pnpm exec amb-mcp seed agents .cursor/agents
```

### The `orchestrator` creates a thread but other agents do not reply

Check that:

- the target roles exist in your registry
- the agents were registered into AMB
- all clients use the same `MESSAGE_BUS_PROJECT_ID`
- the roles in your prompt match the roles you actually registered

For the first run, keep all roles in one client. Move to Cursor + Codex + Claude Code only after the single-client flow works.

## For AMB Development

If you want to develop AMB itself instead of only using it in your own project, use the source repository workflow and local package builds. That path is separate from the quick start above and is intended for contributors to AMB.

Useful entry points:

- [QUICKSTART.md](QUICKSTART.md) for the short onboarding path
- [docs/guides/developer-runbook.md](docs/guides/developer-runbook.md) for multi-tenancy, signup (tenant + owner), first project, and MCP setup
- [docs/architecture.md](docs/architecture.md) for the system architecture overview
- [docs/reference/SCRIPTS.md](docs/reference/SCRIPTS.md) for repository scripts and dev workflows
- [docs/README.md](docs/README.md) for the full documentation index

From a cloned repository you can also start the same published stack with:

```bash
pnpm run deploy:amb
```

That command uses the published compose file from this repository and defaults to `4333`/`4334` to avoid colliding with the direct quick start above.
