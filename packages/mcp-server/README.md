# `@openaisdk/amb-mcp`

MCP server and CLI for Agent Message Bus (AMB).

Works with Cursor, Codex, Claude Code, and other MCP clients.

Docs:

- English: https://github.com/bizmedia/amb#readme
- Russian: https://github.com/bizmedia/amb/blob/main/README.md
- Repository: https://github.com/bizmedia/amb

## What This Package Does

`@openaisdk/amb-mcp` helps your AI client talk to AMB.

It provides:

- an MCP server for Cursor, Codex, Claude Code, and other MCP clients
- CLI commands to register agents from your project
- a fast `setup` command for first-time onboarding
- access to AMB tools for agents, threads, messages, inbox, and tasks

## Requirements

Before using this package, make sure you have:

- a running AMB instance
- Node.js 20+
- `pnpm` or `npm`
- `MESSAGE_BUS_URL` (base URL of the **AMB API**, e.g. `http://localhost:4334` for the default published compose API port)
- `MESSAGE_BUS_PROJECT_ID`
- `MESSAGE_BUS_ACCESS_TOKEN` (or `MESSAGE_BUS_TOKEN`) when the API requires JWT

If you need the full product quick start, see the main AMB repository ([README](https://github.com/bizmedia/amb/blob/main/README.md), [QUICKSTART](https://github.com/bizmedia/amb/blob/main/QUICKSTART.md)).

## Install

With `pnpm`:

```bash
pnpm add -D @openaisdk/amb-mcp
```

With `npm`:

```bash
npm install -D @openaisdk/amb-mcp
```

## Fastest Setup

Run this in your own project:

```bash
MESSAGE_BUS_URL=http://localhost:4334 \
MESSAGE_BUS_PROJECT_ID=<PROJECT_ID> \
MESSAGE_BUS_ACCESS_TOKEN=<PROJECT_TOKEN> \
pnpm exec amb-mcp setup
```

`setup` will:

- look for `.cursor/agents/registry.json`
- if it is missing, infer agents from `.cursor/agents/*.md` or `.agents/*.md`
- register agents in AMB
- create default threads

This is the recommended first command for new users.

## MCP Config

All MCP clients should point to the same AMB **API** base URL, the same `MESSAGE_BUS_PROJECT_ID`, and the same access token when JWT is enabled.

### Cursor (recommended: gitignored env file)

1. Copy `.cursor/mcp.env.example` to `.cursor/mcp.env` in your project (see the main AMB repo; `.cursor/mcp.env` is gitignored).
2. Set `MESSAGE_BUS_URL`, `MESSAGE_BUS_PROJECT_ID`, and `MESSAGE_BUS_ACCESS_TOKEN` in that file.
3. Create `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "envFile": "${workspaceFolder}/.cursor/mcp.env",
      "env": {
        "AMB_MCP_BOOTSTRAP_LOG": "1"
      }
    }
  }
}
```

See [Cursor MCP documentation](https://cursor.com/docs/mcp) for `envFile` and variable interpolation.

### Codex

Create `.codex/config.toml`:

```toml
[mcp_servers.message-bus]
command = "pnpm"
args = ["exec", "amb-mcp"]

[mcp_servers.message-bus.env]
MESSAGE_BUS_URL = "http://localhost:4334"
MESSAGE_BUS_PROJECT_ID = "22222222-2222-4222-8222-222222222222"
MESSAGE_BUS_ACCESS_TOKEN = "<paste token from Dashboard>"
```

### Claude Code

Add the server to your Claude MCP config:

```json
{
  "mcpServers": {
    "message-bus": {
      "command": "pnpm",
      "args": ["exec", "amb-mcp"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:4334",
        "MESSAGE_BUS_PROJECT_ID": "22222222-2222-4222-8222-222222222222",
        "MESSAGE_BUS_ACCESS_TOKEN": "<paste token from Dashboard>"
      }
    }
  }
}
```

Replace IDs and tokens with values from your Dashboard, then restart the client.

## Example Agent Files

A minimal project can work with agent markdown files like:

```text
.cursor/agents/orchestrator.md
.cursor/agents/po.md
.cursor/agents/architect.md
.cursor/agents/dev.md
.cursor/agents/qa.md
```

If `registry.json` is missing, `setup` can infer agents from these files automatically.

## CLI Commands

```bash
amb-mcp
amb-mcp server
amb-mcp setup [path]
amb-mcp seed agents [path]
amb-mcp seed threads [path]
amb-mcp seed all [path]
```

What they do:

- `amb-mcp` or `amb-mcp server`: run the MCP server
- `amb-mcp setup [path]`: fastest onboarding for the current project
- `amb-mcp seed agents [path]`: register agents only
- `amb-mcp seed threads [path]`: create default threads only
- `amb-mcp seed all [path]`: register agents and create threads

## Token-Efficient Usage

This package is optimized to avoid wasting model tokens:

- heavy list/read tools return compact summary objects by default
- `limit` defaults to `20`
- full payloads are opt-in with `summary=false`

Recommended usage pattern:

- start with small list calls
- fetch detailed data only for one specific object
- use `summary=false` only for targeted inspection

Examples:

```text
get_inbox({ agentId, limit: 10 })
```

```text
get_thread_messages({ threadId, limit: 50, summary: false })
```

## Environment Variables

- `MESSAGE_BUS_URL` — base URL of the AMB **HTTP API** (not necessarily the Dashboard UI port). Default in code: `http://localhost:3333`; published compose typically exposes the API on host port **4334**.

- `MESSAGE_BUS_PROJECT_ID` — required for `setup`; recommended for `seed` commands.

- `MESSAGE_BUS_ACCESS_TOKEN` or `MESSAGE_BUS_TOKEN` — required when the API enforces JWT (project token from the Dashboard).

## Troubleshooting

### MCP tools do not appear

Check that:

- `@openaisdk/amb-mcp` is installed in your project
- your MCP config uses `pnpm exec amb-mcp`
- you restarted the client after editing config

### `setup` cannot reach AMB

Check that:

- AMB is running
- `MESSAGE_BUS_URL` points at the **API** (try `curl $MESSAGE_BUS_URL/api/health`)
- `MESSAGE_BUS_ACCESS_TOKEN` is set if the API returns 401 without it
- Dashboard is reachable in the browser

### `setup` cannot find agents

Check that your project contains one of these:

- `.cursor/agents/registry.json`
- `.cursor/agents/*.md`
- `.agents/*.md`

### Agents do not appear in the Dashboard

Check that:

- `MESSAGE_BUS_PROJECT_ID` is correct
- you are viewing the same project in the Dashboard
- `setup` completed without errors

## Links

- Full AMB docs: https://github.com/bizmedia/amb#readme
- Russian docs: https://github.com/bizmedia/amb/blob/main/README.md
- GitHub repository: https://github.com/bizmedia/amb
