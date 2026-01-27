# 🎯 Task: Local DevOps Setup for Agent Message Bus (Next.js-only)

## Context

We are preparing a **local developer setup** for:

* Next.js UI + API
* Prisma + SQLite (default)
* optional Postgres
* retry worker script
* single machine
* pnpm

---

## Goals

Provide:

* docker-compose for app + db (optional)
* env.example
* prisma migrate workflow
* seed script
* retry worker launcher
* cleanup scripts
* README instructions

---

## Tasks

### 🔹 Docker

* docker-compose.yml
* next-app service
* postgres service (optional profile)
* volumes
* ports exposed

---

### 🔹 Scripts

package.json:

* dev
* db:migrate
* db:seed
* worker:retry
* reset:db

---

### 🔹 Environment

.env.example:

* DATABASE_URL
* RETRY_INTERVAL
* MAX_RETRIES
* PORT

---

### 🔹 Prisma

* migrate deploy
* seed.ts
* reset flow

---

### 🔹 Docs

README.md:

* install
* pnpm dev
* prisma migrate
* seed agents
* run worker
* troubleshooting

---

## Deliverables

* docker-compose.yml
* scripts/*
* README.md
* .env.example
* Makefile (optional)

---

## Acceptance Criteria

* new dev can run in <5 min
* pnpm dev starts UI
* DB created automatically
* seed populates agents
* retry worker runs
* containers restart cleanly

---

## Non-Goals

* Kubernetes
* cloud deployment
* CI/CD
* secrets management
