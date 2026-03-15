# TypeScript / ESLint / Prisma: эталонная конфигурация

При проблемах со сборкой, модулями, ESM/CJS или Prisma — сверяйся с этим документом и официальными примерами.

## Эталонные репозитории

- **NestJS samples:** https://github.com/nestjs/nest/tree/master/sample
  - `01-cats-app` — базовый NestJS tsconfig
  - `22-graphql-prisma` — NestJS + Prisma 7 (`moduleFormat = "cjs"`)
- **Turborepo examples:** https://github.com/vercel/turborepo/tree/main/examples
  - `with-nestjs` — Turborepo + NestJS + shared packages (все CJS)
  - `with-prisma` — Turborepo + Prisma database package

## Архитектура конфигов

Все tsconfig наследуют от `@repo/typescript-config`:

```
packages/typescript-config/
├── base.json          ← общая база (ES2022, strict, NodeNext)
├── nestjs.json        ← extends base → module: commonjs, Node10
├── nextjs.json        ← extends base → module: ESNext, Bundler
└── react-library.json ← extends base → jsx: react-jsx
```

ESLint конфиги из `@repo/eslint-config`:

```
packages/eslint-config/
├── base.js            ← общие правила (turbo, unused-imports, prettier)
├── nest.js            ← extends base → NestJS-правила
├── next.js            ← extends base → Next.js + React правила
└── prettier-base.js   ← prettier конфиг
```

## Главное правило: NestJS = CommonJS

Все пакеты, потребляемые `apps/api`, должны отдавать CJS:

1. **Нет `"type": "module"`** в package.json
2. tsconfig override: `"module": "CommonJS"`, `"moduleResolution": "Node10"`
3. Prisma generator: `moduleFormat = "cjs"`

## Конфиги «как надо»

### apps/api/tsconfig.json

```json
{
  "extends": "@repo/typescript-config/nestjs.json",
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist",
    "strictNullChecks": true
  },
  "include": ["src/**/*"]
}
```

### apps/api/eslint.config.mjs

```js
import { nestJsConfig } from "@repo/eslint-config/nest-js";
export default [...nestJsConfig, { ignores: ["eslint.config.mjs"] }];
```

### apps/web/tsconfig.json

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] },
    "plugins": [{ "name": "next" }]
  }
}
```

### packages/shared и packages/db — tsconfig.json

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "module": "CommonJS",
    "moduleResolution": "Node10"
  }
}
```

### packages/shared и packages/db — package.json

Без `"type": "module"`:

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

### prisma/schema.prisma (generator)

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated"
  moduleFormat = "cjs"
}
```

## devDependencies

Все apps и packages должны иметь:

```json
"devDependencies": {
  "@repo/typescript-config": "workspace:*"
}
```

Apps дополнительно:

```json
"devDependencies": {
  "@repo/eslint-config": "workspace:*"
}
```

## Чеклист при ошибках ESM/CJS

1. Проверить отсутствие `"type": "module"` во всех пакетах, потребляемых NestJS
2. Проверить `"module": "CommonJS"` в tsconfig (override через extends base.json)
3. Проверить `moduleFormat = "cjs"` в Prisma schema
4. Пересобрать:
   ```bash
   cd packages/db && rm -rf src/generated dist && npx prisma generate && pnpm build
   cd packages/shared && rm -rf dist && pnpm build
   pnpm build
   ```
