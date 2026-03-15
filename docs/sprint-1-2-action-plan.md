# Sprint 1-2: Foundation - Action Plan

**Дата:** 2026-01-28  
**Последнее обновление:** 2026-03-15 (Orchestrator)  
**Статус:** 🚧 В работе (Epic 1, тред feature-workflow)  
**Ответственный:** Dev Agent  
**Тред:** [feature-workflow-epic-1.md](./feature-workflow-epic-1.md)

---

## 🎯 Цель Sprint 1-2

Выделить переиспользуемые packages из текущего монолитного кода для подготовки к миграции в Nest.js.

---

## 📋 Stories для реализации

### E1-S1: Выделить `packages/core`
**Приоритет:** P0  
**Статус:** 📋 Ready to Start

**Задачи:**
1. Создать структуру `packages/core/`
2. Вынести доменную логику из `lib/services/`:
   - `agents.ts` → `packages/core/src/services/agents.ts`
   - `threads.ts` → `packages/core/src/services/threads.ts`
   - `messages.ts` → `packages/core/src/services/messages.ts`
3. Создать интерфейс к хранилищу (без Prisma):
   - `packages/core/src/storage/interface.ts`
   - `packages/core/src/storage/in-memory.ts` (для тестов)
4. Написать unit тесты
5. Настроить `package.json` и `tsconfig.json`

**Acceptance Criteria:**
- ✅ Доменная логика без зависимостей от Nest/Next
- ✅ Интерфейс к хранилищу (без Prisma)
- ✅ Unit тесты проходят
- ✅ Можно импортировать из других packages

**Исходные файлы:**
- `lib/services/agents.ts`
- `lib/services/threads.ts`
- `lib/services/messages.ts`

---

### E1-S2: Выделить `packages/db`
**Приоритет:** P0  
**Статус:** 📋 Ready to Start

**Задачи:**
1. Создать структуру `packages/db/`
2. Переместить Prisma schema:
   - `prisma/schema.prisma` → `packages/db/prisma/schema.prisma`
3. Переместить migrations:
   - `prisma/migrations/` → `packages/db/prisma/migrations/`
4. Создать Prisma client export:
   - `packages/db/src/index.ts` экспортирует Prisma client
5. Создать RLS helpers (готовность к RLS):
   - `packages/db/src/rls.ts` (пока заглушки)
6. Настроить `package.json` и `tsconfig.json`

**Acceptance Criteria:**
- ✅ Prisma schema + migrations в packages/db
- ✅ Prisma client экспортируется
- ✅ RLS helpers готовы (интерфейс)
- ✅ Миграции работают

**Исходные файлы:**
- `prisma/schema.prisma`
- `prisma/migrations/`
- `lib/prisma.ts`

---

### E1-S3: Выделить `packages/shared`
**Приоритет:** P0  
**Статус:** 🚧 In Progress (старт 2026-03-15)

**Задачи:**
1. Создать структуру `packages/shared/`
2. Вынести общие типы:
   - `lib/types.ts` → `packages/shared/src/types.ts`
3. Вынести Zod схемы:
   - Создать `packages/shared/src/schemas/`
   - Вынести схемы валидации из API routes
4. Вынести ошибки:
   - `lib/api/errors.ts` → `packages/shared/src/errors.ts`
   - `lib/services/errors.ts` → добавить в shared
5. Вынести константы:
   - `packages/shared/src/constants.ts`
6. Настроить `package.json` и `tsconfig.json`

**Acceptance Criteria:**
- ✅ Общие типы/ошибки/схемы (Zod) в shared
- ✅ Константы вынесены
- ✅ Используется в core/db/sdk (после их создания)

**Исходные файлы:**
- `lib/types.ts`
- `lib/api/errors.ts`
- `lib/services/errors.ts`
- Zod схемы из API routes

---

### E1-S4: Выделить `packages/sdk`
**Приоритет:** P0  
**Статус:** 📋 Ready to Start

**Задачи:**
1. Создать структуру `packages/sdk/`
2. Переместить текущий SDK:
   - `lib/sdk/` → `packages/sdk/src/`
3. Обновить зависимости:
   - Использовать `packages/shared` вместо локальных типов
4. Обновить `createClient`:
   - Поддержка JWT токенов (готовность к vNext)
   - `createClient({ baseUrl, token })`
5. Настроить `package.json` и `tsconfig.json`

**Acceptance Criteria:**
- ✅ TS SDK для внешних проектов
- ✅ `createClient({ baseUrl, token })` работает
- ✅ Использует `packages/shared`
- ✅ Обратная совместимость с текущим API

**Исходные файлы:**
- `lib/sdk/client.ts`
- `lib/sdk/types.ts`
- `lib/sdk/index.ts`

---

## 🏗️ Структура monorepo

После Sprint 1-2 структура должна быть:

```
mcp-message-bus/
├── packages/
│   ├── core/          # Доменная логика
│   │   ├── src/
│   │   │   ├── services/
│   │   │   └── storage/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── db/            # Prisma + RLS
│   │   ├── prisma/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── shared/         # Типы, схемы, ошибки
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── sdk/            # TypeScript SDK
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── app/                # Текущий Next.js (пока не трогаем)
├── pnpm-workspace.yaml # Уже есть
└── package.json        # Root package.json
```

---

## 📦 Зависимости между packages

```
packages/core → packages/shared
packages/db → packages/shared
packages/sdk → packages/shared
```

**Порядок создания:**
1. `packages/shared` (первым, т.к. используется всеми)
2. `packages/core` (использует shared)
3. `packages/db` (использует shared)
4. `packages/sdk` (использует shared)

---

## ✅ Definition of Done для Sprint 1-2

- ✅ Все 4 packages созданы и работают
- ✅ Зависимости настроены через pnpm workspace
- ✅ Unit тесты проходят
- ✅ Текущий код продолжает работать (backward compatibility)
- ✅ Можно импортировать из packages в текущий код

---

## 🚀 Команды для старта

```bash
# 1. Создать структуру packages
mkdir -p packages/{core,db,shared,sdk}/src

# 2. Настроить pnpm workspace (уже есть pnpm-workspace.yaml)

# 3. Создать package.json для каждого package

# 4. Настроить TypeScript для каждого package

# 5. Начать миграцию кода
```

---

## 📝 Примечания

- **Backward compatibility:** Текущий код должен продолжать работать
- **Постепенная миграция:** Не нужно сразу удалять старый код
- **Тесты:** Писать тесты для каждого package
- **Документация:** Обновить README для каждого package

---

## 🔄 Следующий Sprint (2-3)

После завершения Sprint 1-2:
- E1-S5: Создать `apps/api` (Nest.js)
- E1-S6: Мигрировать endpoints в `apps/api`
- E2-S1: Добавить Tenant и Project модели

---

**Готов к старту!** 🚀
