# 🚀 Cursor Step-by-Step Instructions — Agent Message Bus (Local)

This document defines the exact execution order for Cursor and its agents.

---

## 🎯 Goal

Build a working Local Agent Message Bus:

* Next.js backend + UI
* Prisma + SQLite
* Threads
* Messaging
* Inbox
* Retry + DLQ
* UI dashboard
* Seeded agents
* Orchestrator flow

---

# ✅ Phase 0 — Verify Base Project

Cursor must first confirm:

* app/ is a Next.js App Router project
* Prisma is initialized
* schema.prisma exists
* migrations applied
* pnpm dev runs
* homepage loads

If any of these fail → fix before proceeding.

---

# ✅ Phase 1 — Database Layer

Responsible: Architect + Dev

Steps:

1. Validate Prisma schema:

   * Agent
   * Thread
   * Message
2. Ensure relations & indexes exist
3. Document schema in /docs/db.md
4. Architect writes ADR: DB choice (SQLite)

Blocking rule:
❌ No API before DB is stable.

---

# ✅ Phase 2 — Core APIs

Responsible: Dev

Implement endpoints in this order:

1. /api/agents
2. /api/threads
3. /api/threads/:id/messages
4. /api/messages/send

Each endpoint must:

* validate input with Zod
* return JSON
* handle errors explicitly

QA verifies after each endpoint.

---

# ✅ Phase 3 — Inbox & ACK

Responsible: Dev + QA

Implement:

* GET /api/messages/inbox?agentId=
* POST /api/messages/:id/ack
* status transitions: pending → delivered → ack

QA writes regression scenarios.

---

# ✅ Phase 4 — Retry & DLQ

Responsible: Dev + DevOps

Implement:

* retry worker script
* maxRetries logic
* DLQ state
* GET /api/dlq
* retention cleanup

DevOps wires scripts:

* pnpm worker:retry
* pnpm cleanup

---

# ✅ Phase 5 — UI Dashboard

Responsible: UX + Dev

Implement screens:

* Agents list
* Threads list
* Thread viewer
* Message composer
* DLQ viewer
* Create thread dialog

Rules:

* Poll inbox every 3–5s
* Show message statuses
* Auto-scroll
* Empty states

QA validates UX flows.

---

# ✅ Phase 6 — SDK + MCP

Responsible: SDK Agent

Deliver:

* TypeScript SDK
* MCP adapter
* Cursor config examples
* Example agents

---

# ✅ Phase 7 — Orchestrator Workflow

Responsible: Orchestrator Agent

Implement script:

* create workflow thread
* send task to PO
* await response
* dispatch Architect
* dispatch Dev
* dispatch QA
* close thread

---

# ✅ Phase 8 — Seed & Automation

Responsible: DevOps

Implement:

* seed-agents.ts
* seed-threads.ts
* reset-db
* README updates

---

# 🚦 Blocking Rules

Cursor MUST NOT:

* skip phases
* implement UI before API
* implement retry before inbox
* bypass ADR for major decisions

---

# 📌 Definition of Done (Local MVP)

* pnpm dev works
* agents seeded
* threads created
* messages flow
* retry works
* DLQ visible
* UI live updates
* orchestrator script runs end-to-end

---

# 🧠 Escalation Map

Requirements → PO
Architecture → Architect
Testing → QA
Infra → DevOps
SDK → SDK Agent
UX → UX Agent

---

# ▶️ Cursor Execution Command

When starting new work, Cursor should:

1️⃣ Read this file
2️⃣ Identify current Phase
3️⃣ Ask relevant agent to act
4️⃣ Open a thread
5️⃣ Execute tasks
6️⃣ Report back
7️⃣ Move to next Phase

---

End of operational instructions.
