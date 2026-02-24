# Технический дизайн: Productization Multi-Tenant NestJS

**Версия:** 2.0  
**Дата:** 2026-01-28  
**Автор:** System Architect  
**Статус:** Утверждено

> Этот документ описывает технический дизайн для превращения mcp-message-bus в переиспользуемый продукт с multi-tenant архитектурой, Nest.js backend, JWT авторизацией и PostgreSQL RLS.

---

## Содержание

1. [Обзор](#1-обзор)
2. [Архитектура монорепы](#2-архитектура-монорепы)
3. [Модель данных](#3-модель-данных)
4. [JWT и модель доступа](#4-jwt-и-модель-доступа)
5. [RLS стратегия](#5-rls-стратегия)
6. [API структура и версионирование](#6-api-структура-и-версионирование)
7. [Workers архитектура](#7-workers-архитектура)
8. [План миграции](#8-план-миграции)
9. [Решения и ADR](#9-решения-и-adr)

---

## 1. Обзор

### 1.1 Цель

Превратить локальный Agent Message Bus в переиспользуемый продукт:
- Hosted multi-tenant сервис
- Nest.js backend + Next.js Dashboard
- JWT авторизация (user tokens + project tokens)
- Tenant → Projects иерархия
- PostgreSQL с RLS (Row Level Security)
- Project-scoped data isolation

### 1.2 Ключевые решения

Все архитектурные решения задокументированы в ADR:
- [ADR-005](./adr/ADR-005-nestjs-backend.md): Nest.js Backend
- [ADR-006](./adr/ADR-006-multi-tenant-model.md): Multi-Tenant Model
- [ADR-007](./adr/ADR-007-jwt-and-project-tokens.md): JWT Auth
- [ADR-008](./adr/ADR-008-postgres-rls.md): PostgreSQL RLS
- [ADR-009](./adr/ADR-009-hosting-and-infrastructure.md): Hosting (Kubernetes + Podman)
- [ADR-010](./adr/ADR-010-user-authentication.md): User Auth (Own Users Table)
- [ADR-011](./adr/ADR-011-rbac-model.md): RBAC Model
- [ADR-012](./adr/ADR-012-project-token-issuance.md): Project Token Issuance
- [ADR-013](./adr/ADR-013-workers-architecture.md): Workers Architecture

---

## 2. Архитектура монорепы

### 2.1 Структура проекта

```
mcp-message-bus/
├── apps/
│   ├── api/                  # Nest.js API + auth + workers + RLS context
│   │   ├── src/
│   │   │   ├── modules/      # Nest.js modules (agents, threads, messages, etc.)
│   │   │   ├── guards/       # JWT guards, RBAC guards
│   │   │   ├── interceptors/ # RLS context interceptor
│   │   │   ├── workers/      # Background workers (retry, cleanup)
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── web/                  # Next.js Dashboard (HTTP клиент к apps/api)
│       ├── app/              # Next.js App Router
│       ├── components/      # React components
│       └── package.json
│
└── packages/
    ├── core/                 # Доменная логика (threads/messages/inbox/dlq)
    │   ├── src/
    │   │   ├── services/    # Business logic (без Nest/Next)
    │   │   └── types/       # Domain types
    │   └── package.json
    │
    ├── db/                   # Prisma schema/migrations + prisma client + RLS helpers
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── migrations/
    │   ├── src/
    │   │   ├── client.ts    # Prisma client export
    │   │   └── rls.ts       # RLS helper functions
    │   └── package.json
    │
    ├── shared/               # Общие типы/ошибки/схемы (zod), константы
    │   ├── src/
    │   │   ├── types/       # Shared TypeScript types
    │   │   ├── errors/      # Error classes
    │   │   ├── schemas/     # Zod schemas
    │   │   └── constants/   # Constants
    │   └── package.json
    │
    ├── sdk/                  # TS SDK для внешних проектов
    │   ├── src/
    │   │   └── client.ts    # createClient function
    │   └── package.json
    │
    └── mcp-server/           # MCP сервер, использует packages/sdk
        ├── src/
        └── package.json
```

### 2.2 Зависимости между пакетами

```
┌─────────────┐
│  apps/api   │
└──────┬──────┘
       │
       ├──> packages/core
       ├──> packages/db
       └──> packages/shared

┌─────────────┐
│  apps/web   │
└──────┬──────┘
       │
       └──> packages/sdk (или тонкий web-client)
       └──> packages/shared

┌─────────────┐
│ packages/sdk│
└──────┬──────┘
       │
       └──> packages/shared

┌─────────────┐
│packages/core │
└──────┬──────┘
       │
       └──> packages/shared
       └──> (интерфейс к хранилищу, без прямого Prisma)
```

**Принципы:**
- `apps/api` использует `packages/core` для бизнес-логики
- `apps/web` не имеет прямого доступа к БД (только через API)
- `packages/core` не зависит от Prisma напрямую (через интерфейс)
- Все пакеты используют `packages/shared` для общих типов

---

## 3. Модель данных

### 3.1 ER-диаграмма

```
┌─────────────────────┐
│      Tenant         │
├─────────────────────┤
│ id: UUID (PK)       │
│ slug: String        │
│ name: String        │
│ status: String      │
│ createdAt: DateTime│
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│      Project        │
├─────────────────────┤
│ id: UUID (PK)       │
│ tenantId: UUID (FK) │
│ slug: String        │
│ name: String        │
│ status: String      │
│ createdAt: DateTime│
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│       Agent         │
├─────────────────────┤
│ id: UUID (PK)       │
│ tenantId: UUID (FK) │ (денормализация)
│ projectId: UUID (FK)│
│ name: String        │
│ role: String        │
│ status: String      │
│ createdAt: DateTime│
└─────────────────────┘

┌─────────────────────┐
│      Thread         │
├─────────────────────┤
│ id: UUID (PK)       │
│ tenantId: UUID (FK) │ (денормализация)
│ projectId: UUID (FK)│
│ title: String       │
│ status: String      │
│ createdAt: DateTime│
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│      Message        │
├─────────────────────┤
│ id: UUID (PK)       │
│ tenantId: UUID (FK) │ (денормализация)
│ projectId: UUID (FK)│
│ threadId: UUID (FK) │
│ fromAgentId: String │
│ toAgentId: String?  │
│ payload: JSON       │
│ status: String      │
│ retries: Int        │
│ parentId: UUID? (FK)│
│ createdAt: DateTime │
└─────────────────────┘

┌─────────────────────┐
│      User           │
├─────────────────────┤
│ id: UUID (PK)       │
│ tenantId: UUID (FK) │
│ email: String       │
│ passwordHash: String│
│ roles: String[]     │
│ createdAt: DateTime │
└─────────────────────┘

┌─────────────────────┐
│   ProjectToken      │
├─────────────────────┤
│ id: UUID (PK)       │
│ tenantId: UUID (FK) │
│ projectId: UUID (FK)│
│ name: String        │
│ tokenHash: String   │
│ issuedBy: UUID (FK) │
│ createdAt: DateTime │
│ lastUsedAt: DateTime│
│ expiresAt: DateTime?│
│ revokedAt: DateTime?│
└─────────────────────┘
```

### 3.2 Ключевые индексы

| Таблица | Индексы | Назначение |
|---------|---------|------------|
| `Message` | `(projectId, status, createdAt)` | Retry worker queries |
| `Message` | `(projectId, toAgentId, status)` | Inbox queries |
| `Message` | `(tenantId, projectId)` | RLS performance |
| `Agent` | `(tenantId, projectId)` | RLS performance |
| `Thread` | `(tenantId, projectId)` | RLS performance |
| `ProjectToken` | `(tokenHash)` | Token validation |
| `ProjectToken` | `(projectId)` | Token management |

### 3.3 Миграция данных

При переходе с v1 на vNext:
1. Создать `default` tenant
2. Создать `default` project в этом tenant
3. Проставить `tenantId` и `projectId` для всех существующих записей:
   ```sql
   UPDATE agents SET tenant_id = 'default-tenant-id', project_id = 'default-project-id';
   UPDATE threads SET tenant_id = 'default-tenant-id', project_id = 'default-project-id';
   UPDATE messages SET tenant_id = 'default-tenant-id', project_id = 'default-project-id';
   ```

---

## 4. JWT и модель доступа

### 4.1 Типы токенов

**User Tokens** (для Dashboard):
- Subject: `sub: "user"`
- Claims: `tenantId`, `roles[]`, `userId`
- Lifetime: 24 hours (refresh token: 7 days)
- Использование: Dashboard UI, admin API

**Project Tokens** (для machine-to-machine):
- Subject: `sub: "project"`
- Claims: `tenantId`, `projectId`
- Lifetime: 90 days (configurable)
- Использование: SDK, внешние интеграции

### 4.2 JWT Claims Structure

```typescript
// User Token
{
  sub: "user",
  userId: string,
  tenantId: string,
  roles: string[], // ["tenant-admin"] | ["project-admin"] | ["reader"]
  projectId?: string, // для project-scoped операций
  iat: number,
  exp: number,
  iss: "message-bus",
  aud: "message-bus-api"
}

// Project Token
{
  sub: "project",
  tenantId: string,
  projectId: string,
  iat: number,
  exp: number,
  iss: "message-bus",
  aud: "message-bus-api"
}
```

### 4.3 Project Token Issuance (ADR-012)

**Issuance Flow:**
1. Admin создает токен через Dashboard/API
2. Backend генерирует JWT с claims
3. Хранит hash в `ProjectToken` таблице
4. Возвращает полный токен один раз

**Revocation:**
- Установка `revokedAt` в БД
- Проверка при каждом запросе
- Кэширование для производительности

**Rotation:**
- Создание нового токена
- Старый остается валидным до явной отмены
- Zero-downtime rotation

### 4.4 RBAC (ADR-011)

**Роли:**
- `tenant-admin`: полный доступ к tenant и всем проектам
- `project-admin`: полный доступ к конкретному проекту
- `reader`: read-only доступ к проекту

**Permission Matrix:**

| Action | tenant-admin | project-admin | reader |
|--------|--------------|---------------|--------|
| Create project | ✅ | ❌ | ❌ |
| Manage project | ✅ | ✅ (own) | ❌ |
| Issue project token | ✅ | ✅ (own) | ❌ |
| View project data | ✅ | ✅ (own) | ✅ (own) |
| Modify project data | ✅ | ✅ (own) | ❌ |

---

## 5. RLS стратегия

### 5.1 Подход (ADR-008)

**Цель:** Defense-in-depth - даже если забыли фильтр в коде, БД не даст прочитать чужие данные.

**Реализация:**
1. Включить RLS на всех project-scoped таблицах
2. Политики используют session variables:
   - `app.tenant_id`
   - `app.project_id`
3. Все запросы выполняются в транзакции с `SET LOCAL`

### 5.2 RLS Policies

```sql
-- Пример для таблицы Message
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_tenant_project_isolation ON messages
  FOR ALL
  USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    AND project_id = current_setting('app.project_id', true)::uuid
  )
  WITH CHECK (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    AND project_id = current_setting('app.project_id', true)::uuid
  );
```

### 5.3 Prisma Integration

```typescript
// apps/api/src/interceptors/rls.interceptor.ts
@Injectable()
export class RlsInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { tenantId, projectId } = request.user; // из JWT
    
    return this.prisma.$transaction(async (tx) => {
      // Установка RLS контекста
      await tx.$executeRaw`SET LOCAL app.tenant_id = ${tenantId}`;
      await tx.$executeRaw`SET LOCAL app.project_id = ${projectId}`;
      
      // Все запросы в этом обработчике используют этот контекст
      return next.handle();
    });
  }
}
```

### 5.4 Admin Operations

Админские операции (миграции, воркеры) используют:
- Отдельную DB роль с `BYPASSRLS`
- Или отдельное соединение без RLS

---

## 6. API структура и версионирование

### 6.1 Версионирование

**Стратегия:** URL versioning (`/v1/...`)

```
/v1/agents
/v1/threads
/v1/messages
/v1/dlq
/v1/admin/tenants
/v1/admin/projects
/v1/admin/projects/:projectId/tokens
```

### 6.2 Структура Nest.js API

```
apps/api/src/
├── modules/
│   ├── agents/
│   │   ├── agents.controller.ts
│   │   ├── agents.service.ts
│   │   └── agents.module.ts
│   ├── threads/
│   ├── messages/
│   ├── dlq/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── jwt.strategy.ts
│   └── admin/
│       ├── tenants/
│       ├── projects/
│       └── tokens/
├── guards/
│   ├── jwt-auth.guard.ts
│   └── rbac.guard.ts
├── interceptors/
│   └── rls.interceptor.ts
└── main.ts
```

### 6.3 Endpoints Summary

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/v1/auth/login` | User login | - |
| POST | `/v1/auth/refresh` | Refresh token | User token |
| GET | `/v1/agents` | List agents | Project token |
| POST | `/v1/agents` | Register agent | Project token |
| GET | `/v1/threads` | List threads | Project token |
| POST | `/v1/threads` | Create thread | Project token |
| GET | `/v1/messages/inbox` | Get inbox | Project token |
| POST | `/v1/messages/send` | Send message | Project token |
| POST | `/v1/messages/:id/ack` | Acknowledge | Project token |
| GET | `/v1/admin/tenants` | List tenants | tenant-admin |
| POST | `/v1/admin/projects` | Create project | tenant-admin |
| POST | `/v1/admin/projects/:id/tokens` | Issue token | tenant-admin/project-admin |

---

## 7. Workers архитектура

### 7.1 Worker Types (ADR-013)

**Retry Worker:**
- Сканирует `delivered` сообщения старше 60s
- Перемещает в `pending` (retries < MAX) или `dlq` (retries >= MAX)
- Запуск: каждую минуту

**Cleanup Worker:**
- Удаляет старые сообщения (retention: 90 дней по умолчанию)
- Запуск: ежедневно

### 7.2 Архитектура

**MVP:** Single shared workers
- Работают в том же процессе, что и API
- Обрабатывают все tenants/projects
- Используют RLS для изоляции

**Future:** Horizontal scaling
- Отдельные worker процессы
- Координация через DB locks или message queue

### 7.3 Implementation

```typescript
// apps/api/src/workers/retry.worker.ts
@Injectable()
export class RetryWorker {
  @Cron('*/1 * * * *')
  async processRetries() {
    const tenants = await this.prisma.tenant.findMany({ 
      where: { status: 'active' } 
    });
    
    for (const tenant of tenants) {
      const projects = await this.prisma.project.findMany({
        where: { tenantId: tenant.id, status: 'active' }
      });
      
      for (const project of projects) {
        await this.prisma.$transaction(async (tx) => {
          await tx.$executeRaw`SET LOCAL app.tenant_id = ${tenant.id}`;
          await tx.$executeRaw`SET LOCAL app.project_id = ${project.id}`;
          await this.processProjectRetries(tx, project.id);
        });
      }
    }
  }
}
```

---

## 8. План миграции

### Фаза 1: Выделение пакетов
- ✅ Создать структуру `packages/`
- ✅ Вынести `shared/core/db/sdk` в пакеты
- ✅ Убедиться, что текущий функционал работает

### Фаза 2: Nest.js API параллельно
- ✅ Создать `apps/api` с Nest.js
- ✅ Перенести endpoints 1:1 из Next.js API
- ✅ Временно без RLS, но с project scoping в коде

### Фаза 3: Tenant/Projects + миграция данных
- ✅ Добавить Prisma модели `Tenant`, `Project`, `User`, `ProjectToken`
- ✅ Добавить `tenantId/projectId` в рабочие таблицы
- ✅ Backfill данных в default tenant/project

### Фаза 4: JWT auth + project tokens
- ✅ Добавить JWT guard и извлечение `tenantId/projectId`
- ✅ Реализовать token issuance (ADR-012)
- ✅ Обновить SDK/MCP на передачу JWT

### Фаза 5: Включить RLS
- ✅ Включить RLS + политики
- ✅ Перевести Prisma на "scoped transaction" с `SET LOCAL`

### Фаза 6: Dashboard на Nest API
- ✅ `apps/web` использует `apps/api` по HTTP
- ✅ Удалить остатки DB доступа из Next приложения

### Фаза 7: Деплой и эксплуатация
- ✅ Kubernetes manifests (ADR-009)
- ✅ CI/CD pipeline
- ✅ Observability (логи/метрики/алерты)
- ✅ Rate limiting

---

## 9. Решения и ADR

### 9.1 Принятые ADR

| ADR | Решение | Статус |
|-----|---------|--------|
| ADR-005 | Nest.js Backend | ✅ Accepted |
| ADR-006 | Multi-Tenant Model | ✅ Accepted |
| ADR-007 | JWT Auth | ✅ Accepted |
| ADR-008 | PostgreSQL RLS | ✅ Accepted |
| ADR-009 | Hosting (Kubernetes + Podman) | ✅ Accepted |
| ADR-010 | User Auth (Own Users Table) | ✅ Accepted |
| ADR-011 | RBAC Model | ✅ Accepted |
| ADR-012 | Project Token Issuance | ✅ Accepted |
| ADR-013 | Workers Architecture | ✅ Accepted |

### 9.2 Ссылки на ADR

- [ADR-005: Nest.js Backend](./adr/ADR-005-nestjs-backend.md)
- [ADR-006: Multi-Tenant Model](./adr/ADR-006-multi-tenant-model.md)
- [ADR-007: JWT Auth](./adr/ADR-007-jwt-and-project-tokens.md)
- [ADR-008: PostgreSQL RLS](./adr/ADR-008-postgres-rls.md)
- [ADR-009: Hosting Infrastructure](./adr/ADR-009-hosting-and-infrastructure.md)
- [ADR-010: User Authentication](./adr/ADR-010-user-authentication.md)
- [ADR-011: RBAC Model](./adr/ADR-011-rbac-model.md)
- [ADR-012: Project Token Issuance](./adr/ADR-012-project-token-issuance.md)
- [ADR-013: Workers Architecture](./adr/ADR-013-workers-architecture.md)

---

## Приложения

### A. Технологический стек

| Категория | Технология | Версия |
|-----------|------------|--------|
| Runtime | Node.js | 18+ |
| Backend Framework | Nest.js | 10+ |
| Frontend Framework | Next.js | 15 |
| ORM | Prisma | 7 |
| Database | PostgreSQL | 16 |
| UI | React | 18 |
| Components | shadcn/ui | latest |
| Containerization | Podman | latest |
| Orchestration | Kubernetes | 1.28+ |
| Package Manager | pnpm | 8+ |

### B. Команды разработки

```bash
# Запуск всего стека
pnpm dev                    # db + api + web

# Отдельные сервисы
pnpm --filter api dev      # только API
pnpm --filter web dev       # только Dashboard

# Database
pnpm db:migrate            # применить миграции
pnpm db:reset              # сброс БД

# Тесты
pnpm test                  # все тесты
pnpm --filter core test    # unit тесты core
pnpm --filter api test     # integration тесты API
```

---

## История изменений

| Версия | Дата | Автор | Изменения |
|--------|------|-------|-----------|
| 2.0 | 2026-01-28 | System Architect | Полный технический дизайн vNext с всеми ADR |
