# `@amb-app/sdk`

**Scope:** `Frontend`, `Integrations`

TypeScript SDK для HTTP-доступа к AMB API.

## Назначение

- Предоставляет типизированный API-клиент (`createClient`, `MessageBusClient`).
- Инкапсулирует base URL, timeout, project scope, auth token и обработку ошибок.
- Упрощает интеграцию с AMB для web-части, скриптов и внешних инструментов.

## Почему это отдельный пакет

- Transport-логика не смешивается с UI и backend-контроллерами.
- Один клиент используется в разных приложениях без дублирования кода.
- Позволяет независимо версионировать клиентский контракт.

## Потребители

- `apps/web` (основной потребитель).
- Скрипты `apps/web/scripts/*`.
- Внешние интеграции через импорт SDK.

## Публичный API

- Фабрика: `createClient`.
- Класс: `MessageBusClient`.
- Ошибка: `MessageBusError`.
- DTO/типы транспорта из `src/types.ts`.

## Границы и правила зависимостей

- Разрешено: зависеть от `@amb-app/shared` для сущностей/типов.
- Нельзя: импортировать Prisma и серверные модули.
- SDK должен оставаться thin transport layer без бизнес-правил сервера.

## Пример

```ts
import { createClient } from "@amb-app/sdk";

const client = createClient({
  baseUrl: "http://localhost:3333",
  projectId: "project-1",
});

const agents = await client.listAgents();
```

## Локальная разработка

```bash
pnpm --filter @amb-app/sdk run build
```

## Ограничения

- Не реализует offline-cache/retry-queue на стороне клиента.
- Не должен дублировать серверную доменную валидацию.

## Статус

`internal` сейчас, с готовностью к внешнему использованию при публикации.
