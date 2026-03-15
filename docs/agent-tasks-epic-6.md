# Задачи агентов: Epic 6 — Операционная готовность

**Обновлено:** 2026-03-15 (Orchestrator). Epic 6 завершён. E6-S1…E6-S6 — Done.  
**Тред:** [feature-workflow-epic-6.md](./feature-workflow-epic-6.md)  
**Message Bus:** тред `4f897ce3-754c-45af-bed3-0efe0c38c3ca`

---

## Backend (nest-engineer / Dev)

**Область:** apps/api, Nest.js

### ✅ E6-S1 — Rate limiting (Done)

RateLimitGuard (APP_GUARD), per-project key (tenantId/projectId/ip/method), window/max через env, 429 при превышении. e2e 34/34. Artifacts: rate-limit.guard.ts, app.module.ts, e2e.

### ✅ E6-S2 — Observability (Done)

ObservabilityInterceptor, GET /api/observability/metrics (method/route/status/count/latency). e2e 35/35.

### ✅ E6-S3 — Tracing (Done)

x-request-id, traceparent; генерация trace/span; traceId/spanId в structured logs. e2e 37/37.

### ✅ E6-S4 — Health checks (Done)

GET /api/health (public), liveness/readiness, DB connectivity. e2e 38/38.

### ✅ E6-S5 — Deployment automation (Done)

api-ci.yml (Postgres + migrate + typecheck + e2e), production-deploy.sh, deploy/k8s (Deployment, Service, migrate Job).

### ✅ E6-S6 — Backup и disaster recovery (Done)

postgres-backup.sh, postgres-restore.sh, disaster-recovery-runbook.md, npm backup:db/restore:db.

---

## DevOps (по запросу)

E6-S5, E6-S6 могут быть переданы devops при необходимости.

## Architect

**По запросу:** rate limits, observability, deployment.

## QA

**Queued:** после E6-S1 (429), E6-S4 (health), E6-S5 (deployment).
