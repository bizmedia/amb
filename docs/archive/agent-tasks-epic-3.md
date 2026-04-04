# Задачи агентов: Epic 3 — JWT авторизация

**Обновлено:** 2026-03-15 (Orchestrator). Epic 3 завершён. E3-S1…E3-S6 — Done.  
**Тред:** [feature-workflow-epic-3.md](./feature-workflow-epic-3.md)  
**Message Bus:** тред `398ec109-2932-4dca-bc85-e91718a50272`

**Конвенция:** Backend (apps/api, packages/db) — **nest-engineer**; в payload `area: backend`. Frontend — по запросу после JWT.

---

## Backend (nest-engineer / Dev)

**Область:** apps/api, packages/db, Nest.js, JWT

### ✅ E3-S1 — JWT guard в Nest.js (Done)

JwtAuthGuard, auth-context, ProjectGuard/ProjectParamGuard, e2e 25/25. Artifacts: `jwt-auth.guard.ts`, `auth-context.ts`, `project.guard.ts`, `project-param.guard.ts`, `app.module.ts`, e2e.

### ✅ E3-S2 — User tokens (для Dashboard) (Done)

users table + миграция/seed default admin, POST /api/auth/login, user JWT (sub:user, tenantId, roles), public routes, ProjectGuard tenant binding. e2e 28/28. Artifacts: auth.module/controller/service, password.ts, public.decorator, jwt-auth.guard, project.guard, auth-context, schema.prisma, migration 20260315200000_add_users_and_login_seed.

### ✅ E3-S3 — Project tokens (Done)

POST /api/auth/project-tokens, sub:project, tenantId/projectId, выдача только tenant-admin. e2e 31/31.

### ✅ E3-S4 — Admin API для токенов (Done)

/api/admin/projects/:projectId/tokens — POST/GET/revoke/DELETE, RBAC, ProjectToken + RLS. e2e 33/33.

### ✅ E3-S5 — Token rotation и revocation (Done)

DB-backed revocation в JwtAuthGuard, lastUsedAt, rotation + мгновенный revoke. e2e 33/33.

### ✅ E3-S6 — Audit логирование (Done)

ProjectTokenAudit + RLS, события created/used/revoked/deleted, GET .../tokens/:tokenId/audit. e2e 33/33.

---

## Frontend (react-next-engineer / Dev)

**Область:** apps/web, Dashboard

В Epic 3 основной объём — backend (JWT, tokens, Admin API). Задачи для frontend (Login, auth flow, token management UI) — **по запросу** после E3-S2+.

---

## Architect Agent

**По запросу / блокерам:** JWT/claims, users table (ADR-010), RBAC.
