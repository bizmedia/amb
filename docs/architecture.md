# Документация по архитектуре — Agent Message Bus

**Версия:** 1.4  
**Дата:** 04.04.2026  
**Автор:** Architect Agent  
**Статус:** Актуализировано

> Примечание (2026-04-04): документ актуализирован под vNext-архитектуру
> (hosted + local, multi-tenant, JWT, Nest.js backend, PostgreSQL RLS, Kubernetes).
> Дополнительные детали см.:
> - `docs/product/productization-multi-tenant-nestjs.md`
> - `docs/guides/developer-runbook.md` — пошаговый онбординг: tenant / владелец при регистрации, первый проект, MCP
> - `docs/adr/ADR-005-nestjs-backend.md`
> - `docs/adr/ADR-006-multi-tenant-model.md`
> - `docs/adr/ADR-007-jwt-and-project-tokens.md`
> - `docs/adr/ADR-008-postgres-rls.md`

---

## Содержание

1. [Обзор системы](#1-обзор-системы)
2. [Архитектурные принципы](#2-архитектурные-принципы)
3. [Компонентная архитектура](#3-компонентная-архитектура)
4. [Модель данных](#4-модель-данных)
5. [Потоки данных](#5-потоки-данных)
6. [Дизайн API](#6-дизайн-api)
7. [Интеграции](#7-интеграции)
8. [Развёртывание](#8-развёртывание)
9. [Масштабирование](#9-масштабирование)
10. [Безопасность](#10-безопасность)
11. [Мониторинг](#11-мониторинг)
12. [Решения и ADR](#12-решения-и-adr)

---

## 1. Обзор системы

### 1.1 Назначение

Agent Message Bus — шина сообщений для оркестрации AI-агентов в локальном и hosted-сценариях. Система обеспечивает структурированную коммуникацию между агентами через потоки сообщений (threads) с гарантией доставки.

### 1.2 Контекст

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPMENT ENVIRONMENT                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Cursor     │  │   Claude     │  │    GPT       │                  │
│  │   (MCP)      │  │   (SDK)      │  │   (SDK)      │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                 │                 │                           │
│         └─────────────────┼─────────────────┘                           │
│                           │                                             │
│                   ┌───────▼───────┐                                     │
│                   │  Agent        │                                     │
│                   │  Message Bus  │                                     │
│                   │               │                                     │
│                   │  ┌─────────┐  │                                     │
│                   │  │ Nest.js │  │                                     │
│                   │  │   API   │  │                                     │
│                   │  └────┬────┘  │                                     │
│                   │       │       │                                     │
│                   │  ┌────▼────┐  │                                     │
│                   │  │PostgreSQL│ │                                     │
│                   │  └─────────┘  │                                     │
│                   └───────────────┘                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Ключевые характеристики

| Характеристика | Значение |
|----------------|----------|
| Тип развёртывания | Local + Hosted (Kubernetes) |
| Модель доставки | At-least-once с ACK |
| Протокол | REST API (HTTP/JSON) |
| Персистентность | PostgreSQL |
| Модель доступа | JWT для пользователей + project-токены для M2M |
| Изоляция данных | Multi-tenant (Tenant -> Project) + PostgreSQL RLS |
| Масштаб | Single-cluster с путём к горизонтальному масштабированию |

---

## 2. Архитектурные принципы

### 2.1 Основные принципы

| Принцип | Описание | Обоснование |
|---------|----------|-------------|
| **Hosted-ready** | Архитектура пригодна для Kubernetes и on-prem/local | Единая модель разработки и production |
| **Простота** | Минимум движущихся частей | Простота отладки и эксплуатации |
| **Тредоцентричность** | Все сообщения в контексте треда | Организация и трассировка |
| **Надёжная доставка** | ACK + Retry + DLQ | Гарантия обработки |
| **Разделение людей и машин** | User JWT для UI/API, project-токены для интеграций | Минимальные права и прозрачная эксплуатация |
| **Defense in depth** | Guard + RBAC + RLS | Защита от межпроектных/межтенантных утечек |
| **Payload без схемы** | JSON payload без жёсткой схемы | Гибкость для разных агентов |

### 2.2 Архитектурный стиль

**Modular Monorepo Architecture (Web + API + Packages)**

- `apps/web` (Next.js App Router) — Dashboard/UI и BFF-функции
- `apps/api` (Nest.js) — основной backend API с auth, RBAC и project-scoped операциями
- `packages/*` — переиспользуемые модули (`core`, `db`, `shared`, `sdk`, `mcp-server`)
- Чёткое разделение ответственности между презентационным слоем, API и storage

```
┌─────────────────────────────────────────────┐
│              Presentation Layer              │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │  Dashboard  │  │  MCP Server (stdio) │   │
│  │ (Next.js)   │  │  -> API client      │   │
│  └─────────────┘  └─────────────────────┘   │
├─────────────────────────────────────────────┤
│                  API Layer                   │
│      ┌────────────────────────────────┐      │
│      │ Nest.js modules (auth/projects │      │
│      │ agents/threads/messages/...)   │      │
│      └────────────────────────────────┘      │
├─────────────────────────────────────────────┤
│                Data Layer                    │
│  ┌──────────────────────────────────────┐   │
│  │           Prisma ORM                  │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐    │   │
│  │  │ Agent  │ │ Thread │ │Message │    │   │
│  │  └────────┘ └────────┘ └────────┘    │   │
│  └──────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│              Storage Layer                   │
│  ┌──────────────────────────────────────┐   │
│  │      PostgreSQL + RLS policies        │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 2.3 Ограничения

| Ограничение | Описание |
|------------|----------|
| Next.js App Router | Dashboard и BFF/UI слой |
| Nest.js | Основной backend API (`apps/api`) |
| Prisma + PostgreSQL | ORM и база данных |
| Threads mandatory | Все сообщения в тредах |
| Retry worker | Фоновая обработка повторов |
| JWT auth mandatory | User JWT + Project JWT/токены |
| RLS mandatory | Изоляция по tenant/project в PostgreSQL |

---

## 3. Компонентная архитектура

### 3.1 Диаграмма компонентов

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AGENT MESSAGE BUS                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      PRESENTATION LAYER                          │   │
│  │                                                                  │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │   │
│  │  │   Dashboard  │    │   REST API   │    │  MCP Server  │       │   │
│  │  │    (React)   │    │ (Next.js)    │    │   (stdio)    │       │   │
│  │  │              │    │              │    │              │       │   │
│  │  │ • AgentsList │    │ /api/agents  │    │ list_agents  │       │   │
│  │  │ • ThreadView │    │ /api/threads │    │ send_message │       │   │
│  │  │ • InboxView  │    │ /api/messages│    │ get_inbox    │       │   │
│  │  │ • DLQViewer  │    │ /api/dlq     │    │ ack_message  │       │   │
│  │  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │   │
│  │         │                   │                   │                │   │
│  └─────────┼───────────────────┼───────────────────┼────────────────┘   │
│            │                   │                   │                    │
│            └───────────────────┼───────────────────┘                    │
│                                │                                        │
│  ┌─────────────────────────────▼───────────────────────────────────┐   │
│  │                       SERVICE LAYER                              │   │
│  │                                                                  │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │   │
│  │  │   Agents     │    │   Threads    │    │   Messages   │       │   │
│  │  │   Service    │    │   Service    │    │   Service    │       │   │
│  │  │              │    │              │    │              │       │   │
│  │  │ • register   │    │ • create     │    │ • send       │       │   │
│  │  │ • list       │    │ • get        │    │ • getInbox   │       │   │
│  │  │ • search     │    │ • update     │    │ • ack        │       │   │
│  │  │              │    │ • delete     │    │ • retry      │       │   │
│  │  │              │    │              │    │ • getDlq     │       │   │
│  │  └──────────────┘    └──────────────┘    └──────────────┘       │   │
│  │                                                                  │   │
│  └─────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│  ┌─────────────────────────────▼───────────────────────────────────┐   │
│  │                        DATA LAYER                                │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │                    Prisma Client                          │   │   │
│  │  │                                                           │   │   │
│  │  │  ┌──────────┐    ┌──────────┐    ┌──────────────┐        │   │   │
│  │  │  │  Agent   │    │  Thread  │    │   Message    │        │   │   │
│  │  │  │  Model   │    │  Model   │    │    Model     │        │   │   │
│  │  │  └──────────┘    └──────────┘    └──────────────┘        │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                         EXTERNAL COMPONENTS                              │
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │  PostgreSQL  │    │ Retry Worker │    │  TypeScript  │              │
│  │   (Docker)   │    │   (cron)     │    │     SDK      │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Описание компонентов

#### 3.2.1 Dashboard (React)

| Атрибут | Значение |
|---------|----------|
| Технология | React 18 + shadcn/ui |
| Расположение | `app/page.tsx`, `components/dashboard/` |
| Назначение | Визуальный мониторинг и управление |

**Подкомпоненты:**
- `AgentsList` — список агентов со статусами
- `ThreadsList` — список тредов
- `ThreadViewer` — просмотр сообщений в треде
- `InboxViewer` — входящие для выбранного агента
- `DLQViewer` — очередь недоставленных
- `MentionInput` — отправка сообщений с @mentions

#### 3.2.2 REST API (Nest.js)

| Атрибут | Значение |
|---------|----------|
| Технология | Nest.js 11 |
| Расположение | `apps/api/src/` |
| Назначение | HTTP endpoints для всех операций |

**Маршруты API:**
- `/api/auth/*` — регистрация, вход, профиль пользователя
- `/api/projects` — CRUD проектов в tenant scope
- `/api/admin/projects/:projectId/tokens` — выпуск/отзыв project-токенов
- `/api/agents` — CRUD для агентов
- `/api/threads` — CRUD для тредов
- `/api/messages` — отправка, inbox, ACK
- `/api/dlq` — dead letter queue

#### 3.2.3 MCP Server

| Атрибут | Значение |
|---------|----------|
| Технология | @modelcontextprotocol/sdk |
| Транспорт | stdio |
| Расположение | `packages/mcp-server/` |
| Назначение | Интеграция с Cursor IDE |

**Инструменты MCP:**
- `list_agents`, `register_agent`
- `list_threads`, `create_thread`, `get_thread`, `update_thread`, `close_thread`
- `get_thread_messages`, `send_message`
- `get_inbox`, `ack_message`
- `get_dlq`

#### 3.2.4 Service Layer

| Сервис | Файл | Ответственность |
|--------|------|-----------------|
| Agents | `lib/services/agents.ts` | Регистрация, поиск агентов |
| Threads | `lib/services/threads.ts` | Управление тредами |
| Messages | `lib/services/messages.ts` | Сообщения, inbox, ACK, DLQ |

#### 3.2.5 TypeScript SDK

| Атрибут | Значение |
|---------|----------|
| Расположение | `packages/sdk/src/` |
| Назначение | Типизированный клиент для внешних приложений |

**Возможности:**
- Типизированные методы API
- Async iterator для polling inbox
- Автоматический retry

---

## 4. Модель данных

### 4.0 Мультитенантность и владелец тенанта

- **Tenant** — граница изоляции данных на уровне организации / рабочего пространства; см. ADR-006.
- У каждого tenant **минимум один владелец**: пользователь с ролью **`tenant-admin`** в JWT и БД. Он создаётся при **`signup`** вместе с **новым** tenant (одна транзакция); проект при этом **не** создаётся автоматически — пользователь заводит его в Dashboard.
- **Приглашения** других пользователей в тот же tenant — **post-MVP**; в текущей версии у нового tenant один участник (владелец).
- Список и создание проектов в API привязаны к **`tenantId` из токена**, чтобы новый пользователь не видел чужие проекты (в т.ч. legacy *Default Project* из миграций).

Подробнее для разработчиков: `docs/guides/developer-runbook.md` (§ 3).

### 4.1 ER-диаграмма

```
┌─────────────────────┐     1:N     ┌─────────────────────┐
│       Tenant        │────────────>│       Project       │
├─────────────────────┤             ├─────────────────────┤
│ id: UUID (PK)       │             │ id: UUID (PK)       │
│ name: String        │             │ tenantId: UUID (FK) │
│ slug: String        │             │ name: String        │
└──────────┬──────────┘             └──────────┬──────────┘
           │                                   │
           │ 1:N                               │ 1:N
           ▼                                   ▼
┌─────────────────────┐             ┌─────────────────────┐
│        User         │             │        Agent        │
├─────────────────────┤             ├─────────────────────┤
│ id: UUID (PK)       │             │ id: UUID (PK)       │
│ tenantId: UUID (FK) │             │ projectId: UUID(FK) │
│ email: String       │             │ tenantId: UUID (FK) │
│ passwordHash: String│             │ role/status/...     │
│ roles: String[]     │             └──────────┬──────────┘
└─────────────────────┘                        │
                                               │ 1:N
┌─────────────────────┐                        ▼
│    ProjectToken     │             ┌─────────────────────┐
├─────────────────────┤             │       Thread        │
│ id: UUID (PK)       │             ├─────────────────────┤
│ projectId: UUID(FK) │             │ id: UUID (PK)       │
│ tenantId: UUID (FK) │             │ projectId: UUID(FK) │
│ tokenHash: String   │             │ tenantId: UUID (FK) │
│ expiresAt/revokedAt │             └──────────┬──────────┘
└─────────────────────┘                        │
                                               │ 1:N
                                               ▼
                                     ┌─────────────────────┐
                                     │       Message       │
                                     ├─────────────────────┤
                                     │ id: UUID (PK)       │
                                     │ threadId: UUID (FK) │
                                     │ projectId: UUID(FK) │
                                     │ tenantId: UUID (FK) │
                                     │ payload/status/...  │
                                     │ parentId: UUID?     │
                                     └─────────────────────┘
```

### 4.2 Статусы сущностей

#### Agent.status
```
┌────────────┐     online      ┌────────────┐
│  created   │ ──────────────> │   online   │
└────────────┘                 └─────┬──────┘
                                     │
                               timeout│
                                     │
                                     ▼
                               ┌────────────┐
                               │  offline   │
                               └────────────┘
```

#### Thread.status
```
┌────────────┐     close       ┌────────────┐
│    open    │ ──────────────> │   closed   │
└────────────┘                 └────────────┘
```

#### Message.status (State Machine)
```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
┌─────────┐    ┌─────────┐    ┌─────────┐           ┌────┴────┐
│ pending │───>│delivered│───>│   ack   │           │   dlq   │
└─────────┘    └────┬────┘    └─────────┘           └─────────┘
     ▲              │                                    ▲
     │              │ timeout + retry                    │
     │              │ (retries < MAX)                    │
     └──────────────┘                                    │
                    │                                    │
                    │ timeout + retry                    │
                    │ (retries >= MAX)                   │
                    └────────────────────────────────────┘
```

### 4.3 Индексы

| Таблица | Поле | Тип индекса | Назначение |
|---------|------|-------------|------------|
| Message | threadId | B-tree | Выборка сообщений треда |
| Message | toAgentId | B-tree | Inbox query |
| Message | fromAgentId | B-tree | Outbox query |
| Message | status | B-tree | Фильтрация по статусу |
| Message | createdAt | B-tree | Сортировка, retention |

---

## 5. Потоки данных

### 5.1 Отправка сообщения

```
┌─────────┐    POST /messages/send    ┌─────────┐    validate    ┌─────────┐
│  Agent  │ ────────────────────────> │   API   │ ─────────────> │ Service │
│    A    │                           │ Route   │                │  Layer  │
└─────────┘                           └─────────┘                └────┬────┘
                                                                      │
                                                                      │ insert
                                                                      │ status=pending
                                                                      ▼
                                                                ┌──────────┐
                                                                │ PostgreSQL│
                                                                └──────────┘
```

### 5.2 Получение и подтверждение (Inbox + ACK)

```
┌─────────┐  GET /messages/inbox   ┌─────────┐   find pending    ┌──────────┐
│  Agent  │ ────────────────────> │   API   │ ────────────────> │ PostgreSQL│
│    B    │                        │ Route   │                   │          │
└────┬────┘                        └────┬────┘                   │  update  │
     │                                  │                        │  status= │
     │                                  │<─────────messages──────│ delivered│
     │<──────────messages───────────────┘                        └──────────┘
     │
     │ process message
     │
     │  POST /messages/:id/ack
     ├─────────────────────────────────────────────────────────> ┌──────────┐
     │                                                           │ PostgreSQL│
     │                                                           │          │
     │                                                           │  update  │
     │                                                           │  status= │
     │                                                           │   ack    │
     └                                                           └──────────┘
```

### 5.3 Поток повторов (Retry)

```
┌────────────┐
│   cron     │
│ (1 minute) │
└─────┬──────┘
      │
      │ trigger
      ▼
┌─────────────────┐    find delivered    ┌──────────┐
│  Retry Worker   │ ──────────────────> │ PostgreSQL│
│                 │    older than 60s    │          │
└────────┬────────┘                      └──────────┘
         │
         │ for each message
         ▼
   ┌─────────────────┐
   │ retries < MAX?  │
   └────────┬────────┘
            │
     ┌──────┴──────┐
     │ yes         │ no
     ▼             ▼
┌─────────┐   ┌─────────┐
│ status= │   │ status= │
│ pending │   │   dlq   │
│retries++│   │retries++│
└─────────┘   └─────────┘
```

### 5.4 Полный Message Lifecycle

```
                                    ┌─────────────────────┐
                                    │                     │
    Agent A                         │    Message Bus      │                    Agent B
       │                            │                     │                       │
       │ ── sendMessage() ─────────>│                     │                       │
       │                            │ [pending]           │                       │
       │                            │                     │                       │
       │                            │<── pollInbox() ─────────────────────────────│
       │                            │                     │                       │
       │                            │ [delivered] ────────────────────────────────>│
       │                            │                     │                       │
       │                            │                     │                process│
       │                            │                     │                       │
       │                            │<── ackMessage() ────────────────────────────│
       │                            │                     │                       │
       │                            │ [ack] ✓             │                       │
       │                            │                     │                       │
       │                            └─────────────────────┘                       │

```

---

## 6. Дизайн API

### 6.1 Принципы REST API

- **Ориентация на ресурсы** — `/api/{resource}`
- **JSON везде** — тела запросов и ответов
- **Единый формат ответа** — `{ data, error, meta }`
- **Обязательный auth-контекст** — Bearer JWT + project scope где требуется
- **HTTP-коды** — 200, 201, 400, 404, 409, 500

### 6.2 Формат ответа

```typescript
// Успешный ответ
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-27T10:00:00Z"
  }
}

// Ответ с ошибкой
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Тред не найден"
  }
}
```

### 6.3 Сводка endpoints

| Метод | Путь | Описание | Тело запроса |
|--------|------|-------------|--------------|
| POST | `/api/auth/signup` | Регистрация пользователя и tenant | `{email, password, tenantName}` |
| POST | `/api/auth/login` | Вход пользователя | `{email, password}` |
| GET | `/api/projects` | Список проектов tenant | — |
| POST | `/api/projects` | Создание проекта | `{name, ...}` |
| GET | `/api/admin/projects/:projectId/tokens` | Список project-токенов | — |
| POST | `/api/admin/projects/:projectId/tokens` | Выпуск project-токена | `{name, expiresIn?}` |
| GET | `/api/agents` | Список агентов | — |
| POST | `/api/agents` | Регистрация агента | `{name, role, capabilities?}` |
| GET | `/api/agents/search?q=` | Поиск агентов | — |
| GET | `/api/threads` | Список тредов | — |
| POST | `/api/threads` | Создание треда | `{title}` |
| GET | `/api/threads/:id` | Получить тред | — |
| PATCH | `/api/threads/:id` | Обновить тред | `{status}` |
| DELETE | `/api/threads/:id` | Удалить тред | — |
| GET | `/api/threads/:id/messages` | Сообщения треда | — |
| POST | `/api/messages/send` | Отправить сообщение | `{threadId, fromAgentId, toAgentId?, payload, parentId?}` |
| GET | `/api/messages/inbox?agentId=` | Входящие | — |
| POST | `/api/messages/:id/ack` | Подтвердить доставку | — |
| GET | `/api/dlq` | Очередь DLQ | — |
| POST | `/api/dlq/:id/retry` | Повторить одно | — |
| POST | `/api/dlq/retry-all` | Повторить все | — |

---

## 7. Интеграции

### 7.1 MCP (Model Context Protocol)

```
┌───────────────────────────────────────────────────────────────┐
│                        CURSOR IDE                              │
│                                                                │
│  ┌──────────────┐           stdio           ┌──────────────┐  │
│  │   AI Agent   │ <──────────────────────> │  MCP Server  │  │
│  │   (Claude)   │                          │              │  │
│  └──────────────┘                          └──────┬───────┘  │
│                                                   │          │
└───────────────────────────────────────────────────┼──────────┘
                                                    │
                                              HTTP  │
                                                    │
                                            ┌───────▼───────┐
                                            │  Message Bus  │
                                            │   REST API    │
                                            └───────────────┘
```

**Конфигурация** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "message-bus": {
      "command": "node",
      "args": ["mcp-server/dist/index.js"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:3334",
        "MESSAGE_BUS_PROJECT_ID": "<PROJECT_ID>",
        "MESSAGE_BUS_ACCESS_TOKEN": "<PROJECT_TOKEN_OR_USER_JWT>"
      }
    }
  }
}
```

### 7.2 TypeScript SDK

```typescript
import { createClient } from "@amb-app/sdk";

const client = createClient({
  baseUrl: "http://localhost:3334",
  projectId: process.env.MESSAGE_BUS_PROJECT_ID,
  token: process.env.MESSAGE_BUS_ACCESS_TOKEN
});

// Регистрация
const agent = await client.registerAgent({
  name: "my-agent",
  role: "worker"
});

// Polling
for await (const messages of client.pollInbox(agent.id)) {
  for (const msg of messages) {
    await processMessage(msg);
    await client.ackMessage(msg.id);
  }
}
```

### 7.3 Docker Integration

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: messagebus
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/messagebus
```

---

## 8. Развёртывание

### 8.1 Схема развёртывания

```
┌──────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT TOPOLOGY                       │
├──────────────────────────────────────────────────────────────┤
│ Local dev (Podman Compose / pnpm dev)                       │
│  - web (Next.js): :3333                                     │
│  - api (Nest.js):  :3334                                    │
│  - postgres:       :5432                                    │
│  - mcp-server (stdio) -> MESSAGE_BUS_URL (api)              │
│                                                              │
│ Hosted (Kubernetes, ADR-009)                                │
│  - Deployment: amb-web, amb-api                             │
│  - Service/Ingress + TLS                                    │
│  - Job/CronJob: db migrate / background workers             │
│  - Secrets: DATABASE_URL, JWT secrets, registry creds       │
│  - Namespace isolation + horizontal scaling                 │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DATABASE_URL` | Строка подключения к PostgreSQL | `postgresql://...@localhost:5432/messagebus` |
| `PORT` | Порт API (Nest.js) | `3334` |
| `MESSAGE_BUS_URL` | URL API для MCP-клиента | `http://localhost:3334` |
| `MESSAGE_BUS_PROJECT_ID` | Контекст проекта для MCP/SDK | — |
| `MESSAGE_BUS_ACCESS_TOKEN` / `MESSAGE_BUS_TOKEN` | JWT (user/project) для API | — |
| `JWT_SECRET` / `AMB_JWT_SECRET` | Секрет подписи JWT | — |

### 8.3 Последовательность запуска

```
Local:
1. podman compose up -d postgres
2. pnpm db:migrate
3. pnpm dev                          # web + api
4. signup/login в Dashboard
5. создать проект и токен проекта
6. Cursor загружает MCP-сервер (stdio)

Kubernetes:
1. собрать и опубликовать образы web/api
2. kubectl apply Secret/ConfigMap/Deploy/Service/Ingress
3. kubectl apply Job для миграций (`deploy:k8s:migrate`)
4. проверить readiness/liveness и `/api/health`
```

---

## 9. Масштабирование

### 9.1 Текущие ограничения

| Метрика | Текущий лимит | Узкое место |
|---------|---------------|-------------|
| Сообщений/сек | ~100 | Single PostgreSQL |
| Агентов | ~50 | Memory |
| Сообщений в треде | ~10,000 | Query performance |
| Размер payload | ~1MB | JSON parsing |

### 9.2 Вертикальное масштабирование

```
┌─────────────────────────────────────────────────────────────┐
│                  CURRENT (Single Instance)                   │
│                                                              │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │   Next.js    │ ─────> │  PostgreSQL  │                   │
│  │   (1 CPU)    │        │   (1 CPU)    │                   │
│  └──────────────┘        └──────────────┘                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                  SCALED (Vertical)                           │
│                                                              │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │   Next.js    │ ─────> │  PostgreSQL  │                   │
│  │   (4 CPU)    │        │   (8 CPU)    │                   │
│  │  Connection  │        │  + SSD RAID  │                   │
│  │    Pool      │        │  + 32GB RAM  │                   │
│  └──────────────┘        └──────────────┘                   │
│                                                              │
│  Expected: 500-1000 msg/sec                                 │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 Горизонтальное масштабирование (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                  SCALED (Horizontal)                         │
│                                                              │
│            ┌──────────────┐                                  │
│            │ Load Balancer│                                  │
│            └──────┬───────┘                                  │
│                   │                                          │
│      ┌────────────┼────────────┐                            │
│      │            │            │                            │
│  ┌───▼───┐   ┌───▼───┐   ┌───▼───┐                         │
│  │Next.js│   │Next.js│   │Next.js│                         │
│  │  #1   │   │  #2   │   │  #3   │                         │
│  └───┬───┘   └───┬───┘   └───┬───┘                         │
│      │           │           │                              │
│      └───────────┼───────────┘                              │
│                  │                                          │
│          ┌───────▼───────┐                                  │
│          │  PostgreSQL   │                                  │
│          │   Primary     │                                  │
│          └───────┬───────┘                                  │
│                  │                                          │
│          ┌───────▼───────┐                                  │
│          │  PostgreSQL   │                                  │
│          │   Replica     │                                  │
│          └───────────────┘                                  │
│                                                              │
│  Expected: 2000-5000 msg/sec                                │
└─────────────────────────────────────────────────────────────┘
```

### 9.4 Путь к WebSocket (Phase 2)

```
┌─────────────────────────────────────────────────────────────┐
│                  REALTIME (WebSocket)                        │
│                                                              │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │    Agent     │<──────>│   Next.js    │                   │
│  │              │   WS   │  + Socket.io │                   │
│  └──────────────┘        └──────┬───────┘                   │
│                                 │                           │
│                          ┌──────▼───────┐                   │
│                          │    Redis     │                   │
│                          │   Pub/Sub    │                   │
│                          └──────┬───────┘                   │
│                                 │                           │
│                          ┌──────▼───────┐                   │
│                          │  PostgreSQL  │                   │
│                          └──────────────┘                   │
│                                                              │
│  Benefits:                                                   │
│  • Real-time updates (no polling)                           │
│  • Lower latency (~10ms vs ~1000ms)                         │
│  • Reduced database load                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Безопасность

### 10.1 Модель безопасности

| Аспект | Текущее состояние | Обоснование |
|--------|-------------------|-------------|
| Аутентификация (люди) | User JWT (signup/login) | Доступ к Dashboard и admin API |
| Аутентификация (машины) | Project-токены/JWT | M2M интеграции в scope одного проекта |
| Авторизация | RBAC (tenant-admin, project-admin, reader) | Разделение прав по tenant/project |
| Изоляция данных | Project/Tenant scoping + PostgreSQL RLS | Defense in depth на уровне БД |
| Шифрование в transit | HTTPS в hosted, HTTP в local dev | Production security + DX локально |
| Аудит | Токены и чувствительные операции журналируются | Трассировка и расследование инцидентов |

### 10.2 Рекомендации для production

Production baseline:

1. **JWT + Project Tokens** — обязательная проверка подписи, срока и revoke-статуса.
2. **HTTPS/TLS** — TLS для внешнего трафика через Ingress.
3. **Rate Limiting** — лимиты на auth/token/admin endpoints.
4. **Input Validation** — строгая валидация payload (Zod/DTO).
5. **Audit Log** — аудит операций по токенам, ролям, доступу.

---

## 11. Мониторинг

### 11.1 Текущие возможности мониторинга

| Компонент | Мониторинг |
|-----------|------------|
| Dashboard | Визуальный мониторинг агентов, тредов, DLQ |
| API (Nest.js) | `/api/health`, структурированные логи, latency/error-rate |
| PostgreSQL | Метрики БД + логи, контроль пула соединений |
| Web (Next.js) | Логи SSR/клиента, ошибки UI/API-интеграции |
| Retry Worker | Метрики retry/dlq + cron/job logs |

### 11.2 Рекомендуемые метрики (Future)

| Метрика | Описание | Порог |
|---------|----------|-------|
| `messages_pending_count` | Количество pending сообщений | Alert > 1000 |
| `messages_dlq_count` | Размер DLQ | Alert > 10 |
| `api_latency_p95` | Задержка API | Alert > 500ms |
| `inbox_poll_rate` | Частота polling | Info |

---

## 12. Решения и ADR

### 12.1 Принятые решения

| ADR | Решение | Статус |
|-----|---------|--------|
| ADR-001 | PostgreSQL as Database | Accepted |
| ADR-002 | Thread-based Messaging Model | Accepted |
| ADR-003 | ACK/Retry/DLQ Pattern | Accepted |
| ADR-004 | MCP Integration via stdio | Accepted |
| ADR-005 | Выделение backend в Nest.js | Accepted |
| ADR-006 | Multi-Tenant (Tenant → Projects), изоляция по проекту | Accepted |
| ADR-007 | JWT Auth с project-scoped токенами | Accepted |
| ADR-008 | PostgreSQL RLS для изоляции по тенанту/проекту | Accepted |
| ADR-009 | Инфраструктура хостинга (Kubernetes + Podman) | Accepted |
| ADR-010 | Аутентификация пользователей (таблица users) | Accepted |
| ADR-011 | RBAC (tenant-admin, project-admin, reader) | Accepted |
| ADR-012 | Механика выдачи project-токенов | Accepted |
| ADR-013 | Архитектура фоновых воркеров | Accepted |

### 12.2 Ссылки на ADR

- [ADR-001: PostgreSQL as Database](./adr/ADR-001-postgresql-database.md)
- [ADR-002: Thread-based Messaging](./adr/ADR-002-thread-messaging.md)
- [ADR-003: ACK/Retry/DLQ Pattern](./adr/ADR-003-ack-retry-dlq.md)
- [ADR-004: MCP Integration](./adr/ADR-004-mcp-integration.md)
- [ADR-005: Nest.js Backend](./adr/ADR-005-nestjs-backend.md)
- [ADR-006: Multi-Tenant Model](./adr/ADR-006-multi-tenant-model.md)
- [ADR-007: JWT and Project Tokens](./adr/ADR-007-jwt-and-project-tokens.md)
- [ADR-008: PostgreSQL RLS](./adr/ADR-008-postgres-rls.md)
- [ADR-009: Hosting and Infrastructure](./adr/ADR-009-hosting-and-infrastructure.md)
- [ADR-010: User Authentication](./adr/ADR-010-user-authentication.md)
- [ADR-011: RBAC Model](./adr/ADR-011-rbac-model.md)
- [ADR-012: Project Token Issuance](./adr/ADR-012-project-token-issuance.md)
- [ADR-013: Workers Architecture](./adr/ADR-013-workers-architecture.md)

### 12.3 Уточнения архитектора (Epic 1–6)

Ниже — зафиксированные контракты и указатели для разработки по эпам.

#### Интерфейс хранилища (Epic 1, packages/core)

Единый контракт персистентности — **`MessageBusStorage`** (`packages/core/src/storage/interface.ts`). Все операции принимают `projectId`; реализация (Prisma в `packages/db` или in-memory для тестов) обеспечивает изоляцию по проекту.

- **Agents:** `listAgents`, `createAgent`, `searchAgents`, `getAgentById`
- **Threads:** `listThreads`, `createThread`, `getThreadById`, `listThreadMessages`, `updateThreadStatus`, `deleteThread`
- **Messages:** `createMessage`, `getMessageById`, `updateMessageStatus`, `findMessages`, `getInboxAndMarkDelivered`, `updateManyMessages`, `updateManyMessagesToStatus`, `deleteManyMessages`

Типы входов: `CreateAgentInput`, `CreateThreadInput`, `SendMessageInput` — в том же файле. Расширять интерфейс только с учётом обратной совместимости существующих реализаций.

#### Контракт RLS helpers (Epic 1, packages/db)

В `packages/db/src/rls.ts` экспортируются две функции для установки контекста **в рамках одной SQL-транзакции** (`SET LOCAL` через `set_config(..., true)`):

- **`setTenantContext(tx, tenantId)`** — устанавливает `app.tenant_id`
- **`setProjectContext(tx, projectId)`** — устанавливает `app.project_id`

Вызывать в начале транзакции до любых чтений/записей; политики RLS (ADR-008) опираются на эти переменные. Не использовать вне транзакции Prisma.

#### Epic 2–5 (указатели)

| Эпик | Контекст | Документы |
|------|----------|-----------|
| E2 | Tenant/Project, RLS, контекст в запросах | ADR-006, ADR-008 |
| E3 | JWT/claims, users, RBAC | ADR-010, ADR-011 |
| E4 | Dashboard, auth flow, UI | feature-workflow-epic-4, ADR-010/011 |
| E5 | Структура документации, DX | docs/ в репозитории, ADR-013 при workers |
| E6 | Операционная готовность: rate limiting, observability, health, deployment, backup | Разделы 10.2, 11; при необходимости — отдельный ADR по production-readiness |
| E7 | Локализация (i18n): библиотека, конвенции ключей, перевод сообщений API в UI | Раздел ниже; apps/web — next-intl |

#### Локализация (Epic 7)

- **Библиотека:** [next-intl](https://next-intl-docs.vercel.app/) (уже в use: `apps/web`, Next.js App Router). Плагин в `next.config.ts`, конфиг в `i18n/request.ts`, `i18n/routing.ts`, `i18n/navigation.ts`. Локали: `en`, `ru`, `de` (расширяемо в `routing.locales`).
- **Файлы переводов:** `apps/web/messages/{locale}.json` — один JSON на язык; ключи — namespace.key или плоские в рамках namespace.
- **Конвенции ключей:** использовать неймспейсы по экрану/модулю (например `Dashboard`, `Tokens`, `Login`, `Common`). Формат ключей: `PascalCase` для неймспейсов, `camelCase` для ключей внутри (например `Dashboard.agentsList`, `Common.save`). Сообщения API, показываемые в UI: маппинг кода ошибки → ключ перевода в `lib/api/error-i18n` (или аналог); не хранить сырые строки от API в переводах, только ключи.
- **Персистенция языка:** переключатель в UI; сохранение в `localStorage` (`amb:locale`) до появления user preferences в API — допустимо (уже используется в `locale-switcher`).

#### Operational readiness (Epic 6)

По запросу при реализации Epic 6 уточнять:

- **Rate limiting** — ограничение запросов по API (на уровне приложения или reverse proxy); пороги и стратегия (по IP, по токену, по endpoint) — в конфигурации или ADR.
- **Observability** — метрики (раздел 11.2), логирование структурированное, трассировка при масштабировании; health endpoint (`/health` или аналог) для readiness/liveness.
- **Deployment** — ADR-009 (Kubernetes + Podman); процесс сборки, миграции БД до старта приложения, откат.
- **Backup** — стратегия бэкапов PostgreSQL (периодичность, хранение, восстановление); согласовать с хостингом (ADR-009).

---

## Приложения

### A. Технологический стек

| Категория | Технология | Версия |
|-----------|------------|--------|
| Runtime | Node.js | 18+ |
| Framework | Next.js | 15 |
| ORM | Prisma | 7 |
| Database | PostgreSQL | 16 |
| UI | React | 18 |
| Components | shadcn/ui | latest |
| MCP SDK | @modelcontextprotocol/sdk | 1.x |
| Package Manager | pnpm | 8+ |

### B. Структура проекта (актуальная: монорепо после Epic 1)

```
amb-app/
├── apps/
│   ├── api/              # Nest.js backend (ADR-005), порт 3334
│   │   ├── src/          # Модули agents, threads, messages, dlq, projects, issues
│   │   └── test/
│   └── web/              # Next.js Dashboard, MCP server, скрипты
│       ├── app/          # API routes (legacy/скрипты), page, layout
│       ├── components/   # dashboard, ui
│       ├── mcp-server/   # MCP (stdio → HTTP к apps/api)
│       └── scripts/     # retry-worker, orchestrator, cleanup
├── packages/
│   ├── core/             # MessageBusStorage, сервисы agents/threads/messages, in-memory
│   ├── db/               # Prisma schema, migrations, client, RLS helpers
│   ├── shared/           # Типы, ошибки, схемы, константы
│   └── sdk/              # TypeScript SDK (createClient, API)
└── docs/
    ├── README.md         # Индекс документации
    ├── architecture.md   # Этот документ
    ├── adr/              # Architecture Decision Records
    ├── prd/              # Product Requirements Documents
    ├── product/          # Видение, бэклог, productization
    ├── guides/           # Онбординг, интеграция, миграции
    ├── reference/        # API, SCRIPTS
    ├── runbooks/         # Деплой, disaster recovery
    ├── architecture/     # Доп. архитектурные материалы (kernel, multi-tenant options)
    ├── epics/            # Декомпозиция крупных эпиков
    ├── ux/               # UX review, design system
    └── archive/          # Исторические workflow / agent-tasks по эпикам
```

---

## История изменений

| Версия | Дата | Автор | Изменения |
|--------|------|-------|-----------|
| 1.0 | 27.01.2026 | Architect Agent | Первоначальная версия |
| 1.1 | 15.03.2026 | Architect Agent | ADR-005..013 в раздел 12; раздел 12.3 — уточнения по storage, RLS, эпам 2–5; структура проекта — монорепо |
| 1.2 | 15.03.2026 | Architect Agent | Epic 6 в раздел 12.3: операционная готовность (rate limiting, observability, health, deployment, backup) |
| 1.3 | 16.03.2026 | Architect Agent | Epic 7 в раздел 12.3: i18n (next-intl), конвенции ключей, персистенция языка |
| 1.4 | 04.04.2026 | Architect Agent | Актуализация под hosted/vNext: Kubernetes deployment, JWT для пользователей и project-токены для M2M, RBAC/RLS как базовая модель безопасности |
