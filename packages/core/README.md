# `@amb-app/core`

**Scope:** `API (domain layer)`, `Workers`

Доменное ядро Agent Message Bus: use-case логика для агентов, тредов и сообщений без привязки к HTTP и конкретной БД.

## Назначение

- Реализует правила предметной области: создание/поиск агентов, жизненный цикл тредов, отправка и ack сообщений.
- Содержит retry/DLQ механику и cleanup-операции.
- Работает через абстракцию storage (`MessageBusStorage`).

## Почему это отдельный пакет

- Изолирует бизнес-логику от transport-слоя (`apps/api`) и persistence (`@amb-app/db`).
- Позволяет тестировать доменные правила отдельно от инфраструктуры.
- Упрощает добавление альтернативных storage-реализаций.

## Потребители

- Текущие: внутренние тесты пакета.
- Целевые: `apps/api`, фоновые воркеры, сервисные утилиты.

## Публичный API

- Сервисы: `listAgents`, `createAgent`, `searchAgents`.
- Сервисы: `listThreads`, `createThread`, `getThreadById`, `listThreadMessages`, `updateThreadStatus`, `deleteThread`.
- Сервисы: `sendMessage`, `getInboxMessages`, `ackMessage`, `retryTimedOutMessages`, `getDlqMessages`, `cleanupOldMessages`, `retryDlqMessage`, `retryAllDlqMessages`.
- Контракты: `MessageBusStorage` и входные DTO-типы.
- Утилита: `InMemoryMessageBusStorage` для тестов/локальной отладки.

## Границы и правила зависимостей

- Разрешено: зависимость от `@amb-app/shared` (типы/ошибки).
- Нежелательно: зависеть от Nest/Next/Prisma и любого HTTP-клиента.
- В пакете не должно быть кода контроллеров, SQL и framework-specific адаптеров.

## Пример

```ts
import { InMemoryMessageBusStorage, createThread } from "@amb-app/core";

const storage = new InMemoryMessageBusStorage();
await createThread(storage, {
  projectId: "project-1",
  title: "Architecture review",
  status: "open",
});
```

## Локальная разработка

```bash
pnpm --filter @amb-app/core run build
pnpm --filter @amb-app/core run test
```

## Ограничения

- Это слой use-case логики, не SDK и не API facade.
- Пакет не содержит авторизацию и project/tenant guard-ы transport-уровня.

## Статус

`internal`, `stable` внутри монорепозитория.
