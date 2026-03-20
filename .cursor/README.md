# 🧭 Cursor Project Instructions — Agent Message Bus (Local)

## Project Overview

This repository contains a **local-first Agent Message Bus** implemented as a **monorepo** (Turborepo + pnpm):

* **`apps/web`** — Next.js (App Router): Dashboard UI and **BFF** route handlers under `app/api/*` that call the Nest backend via `API_URL` / SDK.
* **`apps/api`** — NestJS: canonical REST API (`/api/...`), Prisma via `packages/db`, JWT-aware guards.
* **`packages/db`** — Prisma schema and migrations (PostgreSQL).
* **MCP server** — `packages/mcp-server` (`@openaisdk/amb-mcp`).

Thread-based messaging, inbox, ACK, retry, and DLQ are implemented on the API side. Typical local URLs: web **3333**, API **3334**.

---

## Repository Structure

Root (high level):

```text
apps/
  api/          → NestJS backend
  web/          → Next.js dashboard + BFF routes
packages/
  db/           → Prisma
  sdk/          → @amb-app/sdk
  mcp-server/   → MCP + amb-mcp CLI
  shared/, core/
.cursor/        → agent prompts + registry
```

Inside **`apps/web`**: `app/` (routes, `app/api/*` BFF), `components/`, `lib/`, scripts for seed/examples.

Inside **`apps/api`**: Nest modules, controllers, guards, e2e tests.

---

## Development Rules

### ✅ Architecture

* **Do not** put Prisma or direct DB access in `apps/web` for bus/domain data — use **`apps/api`** and HTTP (`getApiClient`, `@amb-app/sdk`).
* Prefer small handlers; shared validation/types in `packages/shared` where appropriate.
* PostgreSQL for local/dev (see `docker-compose.yml`, port **5433** on host).

### ✅ Coding Standards

* TypeScript strict
* Zod for input validation
* No `any`
* Thin route/controller layers; non-trivial logic in services/modules (`apps/api`) or `lib/` (`apps/web`)

### ✅ Testing

* Prefer e2e against **`apps/api`** (`apps/api/test`) for contract-critical flows.
* UI smoke tests for **`apps/web`** as needed.

### ✅ Security & config

* Secrets and `JWT_SECRET` live in env / `apps/api/.env`, not in client bundles.
* **`apps/web`** BFF forwards to Nest using server-side `API_URL`; do not expose internal URLs to the browser unnecessarily.

---

## Agent System

See `.cursor/agents/` and `registry.json` for orchestration prompts. MCP connects to running **`apps/web`** (e.g. `http://localhost:3333`) with a project id from the Dashboard.

---

## Local commands (from repo root)

* `pnpm dev` — **`apps/web`** + **`apps/api`** in watch mode
* `pnpm dev:api` — only **`apps/api`**
* `pnpm db:migrate` — Prisma via **`packages/db`**
* Seed/examples: `pnpm seed:agents`, `pnpm example:simple` (scripts live under **`apps/web`**)

---

*Phased build guide: [STEP_BY_STEP.md](STEP_BY_STEP.md) — часть шагов исторически про монолитный Next; фактическая кодовая база: **`apps/web` + `apps/api`**.*
