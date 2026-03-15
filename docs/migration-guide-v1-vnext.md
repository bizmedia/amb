# Migration Guide: v1 -> vNext

Гайд для перехода со старого режима AMB (монолитный web + локальные вызовы) на vNext (apps/api + JWT + project scope).

## Ключевые изменения

1. Архитектура:
- Было: акцент на `apps/web` как единая точка с доступом к данным.
- Стало: `apps/api` (Nest, порт `3334`) + `apps/web` (Next, порт `3333`) как Dashboard/Proxy.

2. Аутентификация:
- Было: нестрогий/локальный доступ в ряде сценариев.
- Стало: JWT обязателен для рабочих API-сценариев.
- Для интеграций используйте project token (`Authorization: Bearer <JWT>` + `x-project-id`).

3. SDK:
- Было: строковый вызов `createClient("http://localhost:3333")` в legacy-примерах.
- Стало: объектная конфигурация `createClient({ baseUrl, token, projectId })`.

## Breaking Changes

1. Требуется JWT для операций с project-scoped данными.
2. Нужен корректный `projectId` (UUID) в контексте SDK/API.
3. SDK и примеры ориентированы на `apps/api` как источник данных (`API_URL`, по умолчанию `http://localhost:3334`).
4. Docker-compose сценарий теперь поднимает `postgres + api + web + seed`, а не одиночный `app`.

## SDK Migration Steps

### Before

```ts
import { createClient } from "@amb-app/sdk";

const client = createClient("http://localhost:3333");
```

### After

```ts
import { createClient, MessageBusError } from "@amb-app/sdk";

const client = createClient({
  baseUrl: "http://localhost:3334",
  token: process.env.AMB_TOKEN,
  projectId: process.env.AMB_PROJECT_ID,
});

try {
  await client.listThreads();
} catch (error) {
  if (error instanceof MessageBusError && error.isAuthError) {
    // 401/403 auth handling
  }
}
```

## API Migration Steps

1. Получите JWT (`POST /api/auth/login` для user token или через UI создайте project token).
2. Добавьте заголовки:
- `Authorization: Bearer <JWT>`
- `x-project-id: <PROJECT_ID>`
3. Для Web-прокси убедитесь, что `API_URL` указывает на `apps/api` (`http://localhost:3334` в локальной разработке).

## Docker Migration Steps

1. Установите зависимости:

```bash
pnpm install
```

2. Запустите стек:

```bash
docker compose up --build
```

3. Если порты заняты:

```bash
API_PORT=4334 WEB_PORT=4333 docker compose up --build
```

4. Проверка:
- `api` и `web` в статусе `healthy`.
- `seed` завершён с кодом `0`.

## Checklist

- [ ] SDK инициализируется через `createClient({ baseUrl, token, projectId })`.
- [ ] В интеграциях передаётся JWT.
- [ ] В интеграциях передаётся корректный UUID `projectId`.
- [ ] Обновлены env-переменные (`API_URL`, `AMB_TOKEN`, `AMB_PROJECT_ID`).
- [ ] Локальный запуск проверен через новый `docker compose`.
