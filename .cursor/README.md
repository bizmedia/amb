# 🧭 Cursor Project Instructions — Agent Message Bus (Local)

## Project Overview

This repository contains a **local-only Agent Message Bus** implemented with:

* Next.js App Router
* Prisma + SQLite
* shadcn/ui UI
* Thread-based messaging
* Inbox + retry + DLQ (planned)
* No authentication
* Single-user dev tool

The goal is to orchestrate multiple AI agents locally using threads and message routing.

---

## Repository Structure

Root:

.cursor/          → agent system prompts + registry
scripts/          → seed & orchestration scripts
app/              → Next.js application

Inside `app/`:

app/api/          → route handlers
app/prisma/       → schema + migrations
app/lib/          → prisma client
app/components/   → UI panels

---

## Development Rules

### ✅ Architecture

* Only Next.js backend (no NestJS)
* App Router only
* Prisma for DB
* SQLite for Local MVP
* Thread-based conversations are mandatory
* All API routes live in `app/api/*`
* Background jobs go to `scripts/`

---

### ✅ Coding Standards

* TypeScript strict
* Zod for input validation
* No `any`
* Small route handlers, logic in services
* Deterministic APIs
* Explicit error responses

---

## API Responsibilities

Agents must interact only through HTTP endpoints:

* /api/agents
* /api/threads
* /api/messages/send
* /api/threads/:id/messages

Future:

* /api/messages/:id/ack
* /api/messages/inbox
* /api/dlq

---

## Workflow for Cursor Agents

All work must happen in threads:

1. PO defines scope
2. Architect produces ADR
3. Dev implements
4. QA validates
5. DevOps wires scripts
6. Orchestrator coordinates

No agent skips roles.

---

## Local Setup (for Cursor)

From `/app`:

pnpm dev
pnpm prisma migrate dev
pnpm seed:agents

---

## Implementation Order

Cursor should implement features in this order:

1️⃣ Prisma schema
2️⃣ Agents API
3️⃣ Threads API
4️⃣ Messages API
5️⃣ Inbox + ack
6️⃣ Retry/DLQ worker
7️⃣ UI
8️⃣ Orchestrator scripts

---

## Cursor Agent Rules

When acting as an agent:

* Follow your system prompt in `.cursor/agents/<role>.md`
* Do not implement outside your role
* Ask other agents via threads
* Update status in thread when done

---

## Non-Goals

* No auth
* No cloud infra
* No Kubernetes
* No multi-tenant
* No SaaS hardening

---

## Success Criteria

* pnpm dev starts app
* agents can be seeded
* threads created
* messages exchanged
* UI shows data
* retry + DLQ work

---

## Escalation

If blocked:

* Requirements → PO
* Architecture → Architect
* Infra → DevOps
* UX → UX agent

---

End of instructions.
