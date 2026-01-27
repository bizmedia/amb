# 🎯 Task: QA Validation for Local Agent Message Bus (Next.js-only)

## Context

We are testing a **local-only Agent Message Bus** built with:

* Next.js App Router
* Prisma + PostgreSQL (with `@prisma/adapter-pg`)
* shadcn/ui UI
* Threads + inbox model
* Retry + DLQ
* No auth
* Runs on localhost

---

## Goals

Validate:

* API correctness
* Thread lifecycle
* Message ordering
* Retry + DLQ logic
* UI polling behavior
* Data integrity in Prisma

---

## Test Areas

### 🔹 Agents

* register agent
* duplicate names allowed / not allowed (document)
* status updates
* lastSeen updated

---

### 🔹 Threads

* create thread
* list threads
* archived thread cannot receive new messages
* messages linked only to correct thread

---

### 🔹 Messages

* send message
* reply to message (parentId)
* ordering by createdAt ASC
* broadcast behavior
* ack flow
* retry increments
* DLQ after maxRetries

---

### 🔹 Inbox

* polling returns only unacked messages
* filtering by threadId
* concurrent readers safe

---

### 🔹 UI

* threads refresh after creation
* messages auto-update
* empty states
* long thread scroll
* status badges
* send button disabled when empty

---

## Deliverables

* QA checklist (markdown)
* Postman/Bruno collection
* happy-path сценарий
* edge cases list
* bug report template
* regression suite

---

## Acceptance Criteria

* all endpoints exercised
* DLQ scenario reproduced
* retry verified
* UI works without reload
* no data corruption
* no crashes in logs

---

## Non-Goals

* security testing
* load testing
* multi-tenant
* cloud infra

---

## Quick curl smoke checks

Use `http://localhost:3001` if `3000` is busy.

Create an agent:

```bash
curl -s -X POST http://localhost:3001/api/agents \
  -H 'Content-Type: application/json' \
  -d '{"name":"PO","role":"product","capabilities":{"scope":["requirements"]}}'
```

List agents:

```bash
curl -s http://localhost:3001/api/agents
```

Create a thread:

```bash
curl -s -X POST http://localhost:3001/api/threads \
  -H 'Content-Type: application/json' \
  -d '{"title":"API smoke thread","status":"open"}'
```

List threads:

```bash
curl -s http://localhost:3001/api/threads
```

Send a message (replace IDs):

```bash
curl -s -X POST http://localhost:3001/api/messages/send \
  -H 'Content-Type: application/json' \
  -d '{"threadId":"<thread-id>","fromAgentId":"<from-agent-id>","toAgentId":"<to-agent-id>","payload":{"text":"hello"}}'
```

List messages for a thread:

```bash
curl -s http://localhost:3001/api/threads/<thread-id>/messages
```

Inbox for an agent (marks pending as delivered):

```bash
curl -s "http://localhost:3001/api/messages/inbox?agentId=<agent-id>"
```

Ack a delivered message:

```bash
curl -s -X POST http://localhost:3001/api/messages/<message-id>/ack
```

Inbox + ACK flow (status transition):

```bash
# 1) Send a message
curl -s -X POST http://localhost:3001/api/messages/send \
  -H 'Content-Type: application/json' \
  -d '{"threadId":"<thread-id>","fromAgentId":"<from-agent-id>","toAgentId":"<to-agent-id>","payload":{"text":"inbox check"}}'

# 2) First inbox fetch should mark pending -> delivered
curl -s "http://localhost:3001/api/messages/inbox?agentId=<to-agent-id>"

# 3) Ack the message (idempotent)
curl -s -X POST http://localhost:3001/api/messages/<message-id>/ack
curl -s -X POST http://localhost:3001/api/messages/<message-id>/ack
```

---

# ✅ Phase 3 Validation — Inbox & ACK

## Test Script

Run automated tests:

```bash
chmod +x scripts/test-phase3.sh
./scripts/test-phase3.sh
```

## Test Scenarios

### Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create Agent A | 201, returns `id` |
| 2 | Create Agent B | 201, returns `id` |
| 3 | Create Thread | 201, returns `id` |
| 4 | Send message A→B | 201, `status: "pending"` |
| 5 | Inbox fetch (B) | Message returned, `status: "delivered"` |
| 6 | Inbox fetch #2 (B) | Same message, `status: "delivered"` (idempotent) |
| 7 | ACK message | `status: "ack"` |
| 8 | Inbox fetch (B) | Empty array (message gone) |

### Edge Cases

| Case | Action | Expected |
|------|--------|----------|
| Double ACK | ACK same message twice | Second call succeeds, `status: "ack"` |
| ACK unknown | ACK non-existent UUID | 404 `not_found` |
| ACK pending | ACK before inbox fetch | 409 `conflict` |
| Invalid UUID | ACK with bad ID format | 400 `invalid_params` |

## Status Transitions

```
[send] → pending → [inbox] → delivered → [ack] → ack
```

- `pending`: Message created, not yet fetched
- `delivered`: Inbox fetched, awaiting ACK
- `ack`: Confirmed received

## Validation Checklist

- [ ] `POST /api/agents` — creates agent
- [ ] `POST /api/threads` — creates thread
- [ ] `POST /api/messages/send` — creates message with `status: pending`
- [ ] `GET /api/messages/inbox` — returns messages, transitions `pending → delivered`
- [ ] `GET /api/messages/inbox` (repeat) — idempotent, still `delivered`
- [ ] `POST /api/messages/:id/ack` — transitions `delivered → ack`
- [ ] `POST /api/messages/:id/ack` (repeat) — idempotent
- [ ] `GET /api/messages/inbox` (after ack) — message not returned
- [ ] 404 for unknown message ACK
- [ ] 409 for ACK on pending message

## Phase 3 Status

**STATUS: PENDING VALIDATION**

Run `./scripts/test-phase3.sh` and update this section with results.
