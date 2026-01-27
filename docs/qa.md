# 🎯 Task: QA Validation for Local Agent Message Bus (Next.js-only)

## Context

We are testing a **local-only Agent Message Bus** built with:

* Next.js App Router
* Prisma + SQLite
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
