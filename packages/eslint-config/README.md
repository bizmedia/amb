# `@repo/eslint-config`

**Scope:** `Infra (all packages/apps)`

Общие ESLint-конфигурации монорепозитория.

## Назначение

- Единые правила качества кода и style consistency.
- Специализированные пресеты для разных контекстов исполнения.
- Централизованное управление lint-политикой без дублирования.

## Почему это отдельный пакет

- Конфиг как инфраструктурная зависимость должен быть переиспользуемым.
- Изменения правил применяются ко всем приложениям из одной точки.
- Упрощается подключение lint в новых пакетах.

## Потребители

- `apps/api` через `@repo/eslint-config/nest-js`.
- `apps/web` через `@repo/eslint-config/next-js`.
- Любые будущие apps/packages в workspace.

## Публичные пресеты

- `@repo/eslint-config/base`
- `@repo/eslint-config/next-js`
- `@repo/eslint-config/nest-js`
- `@repo/eslint-config/react-internal`
- `@repo/eslint-config/prettier-base`

## Границы и правила зависимостей

- Только lint-конфигурация и связанные плагины.
- Нельзя добавлять runtime-код приложения.
- Изменения правил должны быть backward-compatible для текущего кода или сопровождаться массовым fix.

## Пример подключения

```js
import { nestJsConfig } from "@repo/eslint-config/nest-js";

export default [...nestJsConfig];
```

## Локальная разработка

- Изменения проверяются через lint в потребителях (`apps/api`, `apps/web`).

## Статус

`internal`, `stable`.
