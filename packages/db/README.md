# `@amb-app/db`

**Scope:** `API (persistence layer)`

Единый persistence-пакет: Prisma schema, миграции и типизированный клиент БД.

## Назначение

- Хранит каноничную модель данных в `prisma/schema.prisma`.
- Содержит все миграции и генерацию Prisma client.
- Экспортирует `PrismaClient`, Prisma-типы и enum'ы домена.
- Содержит RLS-хелперы (`setTenantContext`, `setProjectContext`).

## Почему это отдельный пакет

- Убирает дублирование схем/миграций между приложениями.
- Формирует единый data-contract для API и сервисов.
- Позволяет эволюционировать слой данных независимо от UI/SDK.

## Потребители

- `apps/api` (runtime-доступ к данным).
- Скрипты репозитория (`db:migrate`, `db:studio`, `db:migrate:deploy`).
- Косвенно: модули, импортирующие Prisma-типы из пакета.

## Публичный API

- Экспорты из `src/index.ts`:
- `PrismaClient`, `Prisma`.
- enum'ы: `TaskState`, `TaskPriority`, `EpicStatus`, `SprintStatus`.
- типы: `Agent`, `Message`, `Thread`, `Project`, `Task`, `User`, `Tenant`, `Epic`, `Sprint`.
- RLS helpers из `src/rls.ts`.

## Границы и правила зависимостей

- Источник правды по структуре БД только здесь.
- Не добавлять бизнес-логику и HTTP-валидацию.
- Потребители не должны импортировать `src/generated/*` напрямую, только публичные экспорты пакета.

## Пример

```ts
import { PrismaClient } from "@amb-app/db";

const prisma = new PrismaClient();
const projects = await prisma.project.findMany();
```

## Локальная разработка

```bash
pnpm --filter @amb-app/db run build
pnpm --filter @amb-app/db run db:migrate
pnpm --filter @amb-app/db run db:studio
```

## Ограничения

- Пакет предоставляет инфраструктуру данных, но не оркестрирует транзакционные use-case сценарии.
- RLS-хелперы работают в рамках текущей SQL-транзакции.

## Исторические миграции (не править содержимое)

Уже применённые папки в `prisma/migrations/*` **нельзя изменять** (включая комментарии в `migration.sql`): Prisma хранит checksum; правка ломает `migrate deploy` на существующих БД.

Например, `20260309090000_add_projects` вставляет строку проекта с фиксированным UUID и backfill’ит старые `Agent`/`Thread`/`Message` — это **наследие** этапа до multi-tenant и «проект только из UI». Текущее приложение не опирается на этот UUID в коде; новые окружения могут после миграций иметь эту строку в таблице `Project`, пока её не удалят отдельной data-миграцией или вручную.

## Статус

`internal`, `critical` для всех сервисов.
