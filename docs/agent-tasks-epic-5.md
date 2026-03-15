# Задачи агентов: Epic 5 — Developer Experience

**Обновлено:** 2026-03-16 (Orchestrator)  
**Тред:** [feature-workflow-epic-5.md](./feature-workflow-epic-5.md)  
**Message Bus:** тред `c7a52a0e-fa39-4f05-9109-3fd740c74125`

---

## Dev

**Область:** документация, Docker, SDK-примеры

### ✅ E5-S1 — SDK с JWT поддержкой (Done)

createClient({ baseUrl, token }), Authorization Bearer + x-project-id, MessageBusError: isUnauthorized/isForbidden/isAuthError.

### ✅ E5-S2 — Документация по интеграции (Done)

Сделано:
1. Quick start guide: `docs/integration-guide.md`.
2. API reference: обновлён `docs/api.md` (auth headers + curl).
3. Примеры кода: актуализированы `README.md` и `docs/getting-started.md` под `createClient({ baseUrl, token, projectId })`.

### Очередь

| Story   | Задача |
|---------|--------|
| E5-S3   | Docker Compose: docker compose up запускает DB + API + Web, seed данные ✅ |
| E5-S4   | Migration guide: v1 → vNext, SDK migration steps, breaking changes |
| E5-S5   | Примеры интеграций: разные языки, best practices, common patterns |

### ✅ E5-S3 — Docker Compose для локальной разработки (Done)

Сделано:
1. `docker-compose.yml`: `postgres + api + web + seed`.
2. Добавлен `apps/web/scripts/seed-docker.ts` (login -> token -> project -> seed agents/threads).
3. Проверка запуска: `docker compose up -d --build` с портами `API_PORT=4334 WEB_PORT=4333`; `api/web` healthy, `seed` завершается с кодом `0`.

### ✅ E5-S4 — Migration guide (Done)

Сделано:
1. Добавлен документ `docs/migration-guide-v1-vnext.md`.
2. Описаны breaking changes v1 -> vNext.
3. Добавлены SDK/API/Docker migration steps + checklist.

### ✅ E5-S5 — Примеры интеграций (Done)

Сделано:
1. Добавлен `docs/integration-examples.md`.
2. Примеры для TypeScript SDK, Python requests и curl.
3. Добавлены best practices и common patterns.

---

## Architect

**По запросу:** структура документации, DX.

## QA

**Queued:** QA-review Epic 5 (документация + compose + migration + examples).
