# ADR-015: LLM Cost Observability и оптимизация маршрутизации сообщений

Статус: Разбито  
Дата: 2026-03-28  
Автор: Architect Agent

## Разбиение на дочерние ADR

Исходный зонтичный ADR заменён каноничным набором решений (см. [kernel-architecture-enterprise.md](../architecture/kernel-architecture-enterprise.md)):

| Тема ADR-015 | Дочерний ADR |
|--------------|--------------|
| Граница kernel, Control/Data Plane, запрет смешения с продуктовыми модулями | [ADR-016](./ADR-016-kernel-boundary-and-plane-model.md) |
| Enterprise rules, `PolicyDecision`, точки enforcement, аудит | [ADR-017](./ADR-017-enterprise-rules-and-policy-contract.md) |
| LLM usage/cost, `provider_exact` / `estimated`, soft budgets v1, агрегаты | [ADR-018](./ADR-018-llm-cost-observability-soft-budgets.md) |
| Directed-by-default, broadcast governance, cursor-first reads, anti-amplification, KPI | [ADR-019](./ADR-019-routing-efficiency-and-broadcast-governance.md) |

Детальный план фаз (Prisma `LlmCall`, API, UI, optional `claimed` и hard cap) остаётся в тексте ниже как **исторический материал внедрения**; нормативные контракты и границы ядра — только в ADR-016–019.

---

## Контекст

Нужно решить три задачи одновременно:

1. Пользователь должен видеть стоимость LLM-вызовов (tokens + money) в продукте.
2. Оценка стоимости должна быть достаточно точной для операционного контроля и биллинга.
3. Архитектура обмена сообщениями не должна провоцировать лишний расход токенов (широкий broadcast, повторное чтение длинных тредов, повторная обработка delivered-сообщений).

### Наблюдения по текущей реализации

1. Broadcast фактически включён через `toAgentId = null`, и такие сообщения попадают в inbox каждого агента.
- См. [apps/api/src/messages/messages.service.ts:69](/Users/anatolijtukov/Developer/amb-app/apps/api/src/messages/messages.service.ts:69).

2. Inbox возвращает все `delivered` сообщения (до ACK), что увеличивает шанс повторного чтения одинакового контента агентом при сбоях обработки.
- См. [apps/api/src/messages/messages.service.ts:75](/Users/anatolijtukov/Developer/amb-app/apps/api/src/messages/messages.service.ts:75).

3. SDK `waitForResponse` на каждом poll читает весь тред (`getThreadMessages`) вместо инкрементального чтения.
- См. [packages/sdk/src/client.ts:268](/Users/anatolijtukov/Developer/amb-app/packages/sdk/src/client.ts:268).

4. В модели `Message` нет полей LLM usage/cost, а в observability есть только HTTP-метрики.
- См. [packages/db/prisma/schema.prisma:47](/Users/anatolijtukov/Developer/amb-app/packages/db/prisma/schema.prisma:47) и [apps/api/src/observability/observability.service.ts:1](/Users/anatolijtukov/Developer/amb-app/apps/api/src/observability/observability.service.ts:1).

5. В MCP уже есть механика снижения payload в ответах (`limit`, `summary`, `preview`), но это касается только MCP-инструментов, не SDK/API flow.
- См. [packages/mcp-server/src/tools/response-shaping.ts:44](/Users/anatolijtukov/Developer/amb-app/packages/mcp-server/src/tools/response-shaping.ts:44) и [packages/mcp-server/src/schemas.ts:20](/Users/anatolijtukov/Developer/amb-app/packages/mcp-server/src/schemas.ts:20).

6. В `shapeMessages` используется поле `retryCount`, тогда как доменная модель сообщения хранит `retries`; в summary это поле сейчас может приходить пустым.
- См. [packages/mcp-server/src/tools/response-shaping.ts:127](/Users/anatolijtukov/Developer/amb-app/packages/mcp-server/src/tools/response-shaping.ts:127) и [packages/db/prisma/schema.prisma:65](/Users/anatolijtukov/Developer/amb-app/packages/db/prisma/schema.prisma:65).

---

## Решение

### 1) Ввести first-class модель LLM usage/cost

Стоимость считается не из текста сообщений, а из фактических usage-данных провайдера на каждый LLM call.

#### 1.1 Prisma-модели (новые)

```prisma
model LlmCall {
  id                 String   @id @default(uuid())

  tenantId           String?
  tenant             Tenant?  @relation(fields: [tenantId], references: [id], onDelete: SetNull)
  projectId          String
  project            Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  threadId           String?
  thread             Thread?  @relation(fields: [threadId], references: [id], onDelete: SetNull)
  messageId          String?
  message            Message? @relation(fields: [messageId], references: [id], onDelete: SetNull)

  agentId            String?
  agent              Agent?   @relation(fields: [agentId], references: [id], onDelete: SetNull)

  provider           String   // openai, anthropic, ...
  model              String   // gpt-5.4, ...
  requestType        String   // chat, responses, embeddings, tools
  requestId          String?

  inputTokens        Int      @default(0)
  outputTokens       Int      @default(0)
  cachedInputTokens  Int      @default(0)
  reasoningTokens    Int      @default(0)
  totalTokens        Int      @default(0)

  usageSource        String   // provider_exact | estimated
  priceVersion       String   // e.g. openai-2026-03-01
  currency           String   @default("USD")

  inputCost          Decimal  @db.Decimal(14, 8)
  outputCost         Decimal  @db.Decimal(14, 8)
  cacheCost          Decimal  @db.Decimal(14, 8)
  totalCost          Decimal  @db.Decimal(14, 8)

  metadata           Json?
  createdAt          DateTime @default(now())

  @@index([tenantId])
  @@index([projectId])
  @@index([projectId, createdAt])
  @@index([threadId])
  @@index([messageId])
  @@index([agentId])
  @@index([provider, model])
}

model LlmPriceCard {
  id                    String   @id @default(uuid())
  provider              String
  model                 String
  version               String
  effectiveFrom         DateTime
  effectiveTo           DateTime?
  currency              String   @default("USD")

  inputPer1M            Decimal  @db.Decimal(14, 8)
  outputPer1M           Decimal  @db.Decimal(14, 8)
  cachedInputPer1M      Decimal? @db.Decimal(14, 8)
  reasoningPer1M        Decimal? @db.Decimal(14, 8)

  createdAt             DateTime @default(now())

  @@index([provider, model])
  @@index([effectiveFrom])
  @@unique([provider, model, version])
}
```

#### 1.2 Связи в существующих моделях

- `Project` → `llmCalls LlmCall[]`
- `Thread` → `llmCalls LlmCall[]`
- `Message` → `llmCalls LlmCall[]`
- `Agent` → `llmCalls LlmCall[]`
- `Tenant` → `llmCalls LlmCall[]`

### 2) Стратегия точности

#### 2.1 Градации точности

- `provider_exact`: usage пришёл от провайдера (предпочтительно, использовать всегда).
- `estimated`: usage оценён локально tokenizer-ом (fallback, помечать явно в UI).

#### 2.2 Практическая точность

- Для `provider_exact` точность практически достаточна для биллинга.
- Для `estimated` ожидать отклонения (из-за системных токенов, кеша, внутренних форматов провайдера).
- В отчётах всегда показывать долю точных vs оценочных записей.

### 3) API для cost observability

#### 3.1 Новые endpoint'ы

- `GET /api/observability/llm-cost/summary?from&to&projectId`
  - total tokens/cost, breakdown по source (`provider_exact`/`estimated`).

- `GET /api/observability/llm-cost/by-thread?from&to&limit`
- `GET /api/observability/llm-cost/by-agent?from&to&limit`
- `GET /api/observability/llm-cost/by-model?from&to&limit`
- `GET /api/observability/llm-cost/by-day?from&to`

- `GET /api/threads/:threadId/cost`
- `GET /api/messages/:messageId/cost`

#### 3.2 Ingestion endpoint (internal)

- `POST /api/internal/llm-calls`
  - принимает usage от worker/agent runtime.
  - защищается service token или внутренней сетью.

### 4) Минимальный UI

#### 4.1 Экран `Usage & Cost`

MVP-виджеты:

1. `Total Cost (7d / 30d)`
2. `Total Tokens` + split input/output/cached/reasoning
3. `Top Threads by Cost`
4. `Top Agents by Cost`
5. `Exact vs Estimated` (доля точных измерений)

#### 4.2 В карточке треда

- Cost треда за всё время и за последний день.
- Cost последних N сообщений.

---

## Оптимизация расхода токенов в message-bus

### Решение A: сделать directed messaging default

- `toAgentId` должен быть указан в большинстве сценариев.
- Broadcast (`toAgentId = null`) оставляем только для системных объявлений.
- Ввести soft-policy в API: warning/metric при broadcast без `payload.type in ["system", "workflow_event"]`.

### Решение B: инкрементальный inbox и чтение треда

Добавить cursor-based API:

- `GET /api/messages/inbox?agentId=...&after=...&limit=...`
- `GET /api/threads/:threadId/messages?after=...&limit=...`

Это снимет полное перечитывание тредов в `waitForResponse`.

### Решение C: claim/processing status

Текущее состояние `pending -> delivered -> ack` не различает "взято в работу" и "прочитано".

Предложение:

- `pending -> claimed -> ack`
- claim делает сообщение видимым только конкретному consumer instance на TTL.

Это уменьшит повторные попытки и дублирующее чтение LLM при воркерных сбоях.

### Решение D: payload budget policy

- Лимит размера payload (например, 8-16 KB для inline).
- Большие контексты хранить как артефакты (object storage + pointer в payload).
- Для MCP/агентов по умолчанию summary-first, details-on-demand.

### Решение E: метрики эффективности маршрутизации

Добавить KPI:

- `broadcast_ratio = broadcast_messages / all_messages`
- `avg_recipients_per_message`
- `redelivery_rate`
- `thread_read_amplification` (сколько сообщений было прочитано ради 1 полезного ответа)
- `tokens_per_completed_task`

---

## План внедрения

### Phase 1 (быстрый эффект, 1-2 спринта)

1. Добавить `LlmCall` + `LlmPriceCard` и ingestion endpoint.
2. Подключить запись usage из worker/runtime в `LlmCall`.
3. Добавить summary API + базовый экран `Usage & Cost`.
4. Включить metrics/logging по broadcast usage.

### Phase 2 (оптимизация контекста, 1 спринт)

1. Cursor API для inbox/thread messages.
2. Переписать SDK `waitForResponse` на инкрементальный режим.
3. Ввести лимиты payload и preview-first во всех агентских интеграциях.

### Phase 3 (устойчивость и контроль расходов, 1-2 спринта)

1. Ввести `claimed` статус и lease semantics.
2. Ввести policy-гейт для broadcast (lint/runtime warning + dashboard alert).
3. Добавить budget guardrails (лимиты на project/day, soft/hard cap).

---

## Миграции и обратная совместимость

1. Добавление новых таблиц (`LlmCall`, `LlmPriceCard`) — backward-compatible.
2. API observability — additive.
3. Cursor-параметры в inbox/thread API — additive.
4. Переход к `claimed` статусу — через staged rollout:
- release 1: поддержка нового статуса без обязательности,
- release 2: workers используют claim,
- release 3: старый путь delivered-only выключается флагом.

---

## Полезность для продукта

Да, это напрямую полезно для вашего сценария (мульти-агентная разработка):

1. Прозрачность стоимости на уровне тредов/агентов.
2. Раннее обнаружение "дорогих" паттернов (broadcast, длинные контексты, redelivery).
3. Управляемость бюджета без потери качества (summary-first + targeted routing).

---

## Open Questions

1. Какая валюта и прайс-провайдер являются canonical для UI (`USD` by default)?
2. Нужен ли экспорт cost report в CSV/JSON для внешнего биллинга?
3. Должен ли project-admin видеть только свой проектный cost, а tenant-admin — агрегаты по всем проектам?
4. Нужен ли hard budget cap (блокировка send) или только soft alerts?
