# Задачи агентов: Epic 6 — Операционная готовность

**Обновлено:** 2026-03-15 (Orchestrator). E6-S1 Done. E6-S2 в работе.  
**Тред:** [feature-workflow-epic-6.md](./feature-workflow-epic-6.md)  
**Message Bus:** тред `4f897ce3-754c-45af-bed3-0efe0c38c3ca`

---

## Backend (nest-engineer / Dev)

**Область:** apps/api, Nest.js

### ✅ E6-S1 — Rate limiting (Done)

RateLimitGuard (APP_GUARD), per-project key (tenantId/projectId/ip/method), window/max через env, 429 при превышении. e2e 34/34. Artifacts: rate-limit.guard.ts, app.module.ts, e2e.

### Текущая задача: E6-S2 — Observability (логи/метрики)

**Статус:** In progress | **area:** backend

**Сделать:**
1. Structured logging.
2. Metrics (Prometheus format).
3. Health checks.

**AC:** Structured logging; Metrics (Prometheus); Health checks.  
**Справочно:** [backlog](./backlog.md) Epic 6.

### Очередь

| Story   | Задача |
|---------|--------|
| E6-S2   | Observability: structured logging, metrics (Prometheus), health checks |
| E6-S3   | Tracing: distributed tracing, request correlation IDs |
| E6-S4   | Health checks: /health, DB connectivity, dependency checks |
| E6-S5   | Deployment automation: CI/CD, Docker (Podman), K8s manifests, migration automation |
| E6-S6   | Backup и disaster recovery: strategy, procedures, testing |

---

## DevOps (по запросу)

E6-S5, E6-S6 могут быть переданы devops при необходимости.

## Architect

**По запросу:** rate limits, observability, deployment.

## QA

**Queued:** после E6-S1 (429), E6-S4 (health), E6-S5 (deployment).
