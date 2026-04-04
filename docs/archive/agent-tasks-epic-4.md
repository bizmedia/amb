# Задачи агентов: Epic 4 — Dashboard как продукт

**Обновлено:** 2026-03-16 (Orchestrator). E4-S1…E4-S6 Done. Epic 4 завершён.  
**Тред:** [feature-workflow-epic-4.md](./feature-workflow-epic-4.md)  
**Message Bus:** тред `fb0290b6-57a7-45ea-89c2-7d7af8bae5f8`

**Конвенция:** Frontend (apps/web) — **react-next-engineer**; в payload `area: frontend`. Backend — по запросу.

---

## Frontend (react-next-engineer / Dev)

**Область:** apps/web, Next.js, Dashboard

### ✅ E4-S1 — Next.js Dashboard (apps/web) (Done)

Dashboard component, lib/api/client.ts createClient(baseUrl), app/api/* getApiClient(), без Prisma в web. Evidence: app/[locale]/page.tsx, lib/api/client.ts, api routes.

### ✅ E4-S2 — HTTP клиент к apps/api + JWT (Done)

auth.ts (JWT/cookie, httpOnly set/clear), api/auth/login|logout|session, client.ts token+projectId, http.ts typed helper + ApiHttpError, proxy routes pass token, hooks на typed helper. typecheck pass.

### ✅ E4-S3 — Удалить прямой доступ к БД (Done)

Prisma/@amb-app/db удалены из apps/web; lib/prisma.ts, lib/services/*, prisma.*, scripts (retry-worker, cleanup, reset-db); package.json и root scripts обновлены; Dockerfile без apps/web/prisma. build/typecheck pass.

### ✅ E4-S4 — User authentication flow (Done)

/[locale]/login, protected routes (middleware + server auth gate), logout в header, session check + re-login redirect при expiry/401 (backend /api/auth/refresh нет — реализовано через session-check). httpOnly cookie, i18n Auth/logout. build/typecheck pass.

### ✅ E4-S5 — Tenant/Project management UI (Done)

ProjectSwitcher: список tenant/project, фильтрация по tenant, создание проекта, редактирование имени проекта, переключение контекста (projectId) и копирование projectId.  

### ✅ E4-S6 — Token management UI (Done)

/[locale]/tokens + TokensModule: список project tokens, создание токена, отображение выданного access token с копированием, revoke токена.

### Следующая задача (Frontend)

Epic 5 / E5-S1 — обновить SDK с JWT-поддержкой и auth error handling.

---

## Backend (nest-engineer / Dev)

**Область:** apps/api

API для Epic 4 уже реализован в Epic 2–3 (project-scoped API, JWT, login, project tokens, admin API). Дополнительные изменения в API — **по запросу**.

---

## Architect Agent

**По запросу / блокерам:** структура Dashboard, auth flow, UI для tenant/project/tokens.
