# `@amb-app/shared`

**Scope:** `Shared (API + Frontend + SDK)`

Общие доменные контракты: типы, Zod-схемы, ошибки и константы.

## Назначение

- Единые TS-типы сущностей для API/web/sdk/core.
- Единые Zod-схемы для валидации payload/query/params.
- Общие доменные ошибки (`NotFoundError`, `ConflictError`).

## Почему это отдельный пакет

- Предотвращает расхождение контрактов между приложениями.
- Убирает копипаст DTO/схем.
- Делает изменения API-контракта централизованными.

## Потребители

- `apps/api`.
- `apps/web`.
- `@amb-app/sdk`.
- `@amb-app/core`.

## Публичный API

- `types`: доменные сущности и enum-строки.
- `schemas`: `agents`, `threads`, `messages`, `tasks`, `epics`, `sprints`, `projects`, `auth`, `common`.
- `errors`: `NotFoundError`, `ConflictError`.
- `constants`: общие константы домена.

## Границы и правила зависимостей

- Разрешены только универсальные зависимости (например, `zod`).
- Нельзя тянуть framework/runtime-зависимости (`next`, `@nestjs/*`, `@prisma/client`).
- Нельзя помещать сюда transport-логику (`fetch`, контроллеры, DB-репозитории).

## Пример

```ts
import { createTaskSchema, NotFoundError } from "@amb-app/shared";

const input = createTaskSchema.parse(payload);
if (!input.title) throw new NotFoundError("Task");
```

## Локальная разработка

```bash
pnpm --filter @amb-app/shared run build
```

## Ограничения

- Пакет задаёт контракты, но не содержит поведения use-case уровня.

## Статус

`internal`, `stable`.
