# Импорты без расширений файлов

В проекте **не указывать расширения** (`.js`, `.ts`, `.mts`) в путях импорта/экспорта.

**Нельзя:**
```ts
export * from "./types.js";
import { foo } from "../utils.js";
```

**Можно:**
```ts
export * from "./types";
import { foo } from "../utils";
```

## Настройка TypeScript

Чтобы не требовать расширений, в `tsconfig.json` пакетов использовать:

- `"moduleResolution": "bundler"` (или `"node"`) — тогда явные расширения не обязательны.
- Не использовать `"moduleResolution": "node16"` и `"nodenext"` в пакетах, где нужны импорты без расширений.

Пример для пакета (например `packages/shared/tsconfig.json`):

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

Корневой и приложения (например `apps/web`) уже используют `moduleResolution: "bundler"` — для них правило выполняется по умолчанию.
