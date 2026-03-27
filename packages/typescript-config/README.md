# `@repo/typescript-config`

**Scope:** `Infra (all packages/apps)`

Общие `tsconfig`-профили для всего workspace.

## Назначение

- Стандартизирует TypeScript baseline (strictness, module/target, declaration settings).
- Даёт профильные настройки для Next.js, NestJS и React library.
- Минимизирует конфигурационный drift между пакетами.

## Почему это отдельный пакет

- TS-политика должна поддерживаться централизованно.
- Обновления компиляторных правил применяются единообразно.
- Новые пакеты подключают готовый `extends` вместо копирования конфига.

## Потребители

- `apps/api` (`nestjs.json`).
- `apps/web` (`nextjs.json`).
- TS-пакеты (`@amb-app/db`, `@amb-app/shared`, `@openaisdk/amb-mcp`, и др.).

## Доступные профили

- `base.json`.
- `nextjs.json`.
- `nestjs.json`.
- `react-library.json`.

## Границы и правила зависимостей

- Только tsconfig-файлы и минимальный package metadata.
- Не размещать код, скрипты сборки или runtime-зависимости.
- Изменения в `base.json` рассматривать как архитектурные и проверять на всех потребителях.

## Пример подключения

```json
{
  "extends": "@repo/typescript-config/base.json"
}
```

## Локальная разработка

- Проверка через `pnpm typecheck` в корне репозитория.

## Статус

`internal`, `stable`.
