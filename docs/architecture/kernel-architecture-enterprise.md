# Kernel Architecture (Enterprise Baseline, B2B SaaS)

**Версия:** 1.0  
**Дата:** 2026-03-29  
**Статус:** Baseline (каноничный ориентир)

Связанные ADR (каноничные, **Принято**):

- [ADR-016](./adr/ADR-016-kernel-boundary-and-plane-model.md)
- [ADR-017](./adr/ADR-017-enterprise-rules-and-policy-contract.md)
- [ADR-018](./adr/ADR-018-llm-cost-observability-soft-budgets.md)
- [ADR-019](./adr/ADR-019-routing-efficiency-and-broadcast-governance.md)

Зонтичный [ADR-015](./adr/ADR-015-llm-cost-observability-and-routing-efficiency.md) имеет статус **Разбито**; нормативная часть перенесена в ADR-016–019, детали плана внедрения в ADR-015 оставлены как справочный текст.

---

## 1. Назначение kernel

Kernel — минимальное обязательное ядро платформы, которое гарантирует:
- безопасную изоляцию tenant/project;
- предсказуемую доставку сообщений;
- централизованное исполнение policy;
- трассируемость LLM-вызовов и cost;
- операционную управляемость (audit/alerts/observability).

Kernel не включает продуктовые модульные фичи (например, задачи/эпики/спринты UI).

---

## 2. Kernel boundary

### 2.1 Входит в kernel (mandatory)

1. Identity & Access: JWT claims validation, tenant/project scoping, RBAC guardrails.
2. Policy Engine Contract: deny/allow/warn решения и точки применения.
3. Message Delivery Contract: thread/message/inbox/ack/dlq/retry semantics.
4. Routing Governance: directed-by-default, controlled broadcast, payload guardrails.
5. Cost & Usage Observability: сбор usage/cost, агрегаты, budget alerts.
6. Audit Trail: административные и policy-события с actor/context.
7. Conformance Controls: проверяемые инварианты и матрица ответственности.

### 2.2 Не входит в kernel (extension layer)

1. UI-модули задач, эпиков, спринтов.
2. Orchestration templates/flows как продуктовые сценарии.
3. Domain-specific automation для конкретных команд.
4. Отраслевые compliance-процессы сверх базового B2B SaaS профиля.

---

## 3. Plane model

### 3.1 Control Plane

Control Plane отвечает за политику и управление:
- AuthN/AuthZ (JWT/RBAC)
- Policy evaluation (`PolicyDecision`)
- Audit events
- LLM usage & cost aggregation
- Soft budget governance

Основные точки исполнения:
- API ingress (guards/interceptors)
- Admin operations
- Worker scheduling/execution checks

### 3.2 Data Plane

Data Plane отвечает за поток сообщений:
- message send
- inbox pull
- ack
- retry/dlq
- thread reads

Основные требования:
- project-scoped доступ
- deterministic delivery status transitions
- минимизация read amplification

### 3.3 Взаимодействие planes

1. Data Plane делает операцию (например, `send_message`).
2. Control Plane выполняет policy decision.
3. При `deny` операция отклоняется.
4. При `warn` операция разрешается, но пишется audit/observability event.
5. При `allow` операция выполняется и порождает trace + usage hooks.

---

## 4. Canonical contracts

### 4.1 `MessageEnvelope`

```ts
interface MessageEnvelope {
  id: string;
  tenantId: string;
  projectId: string;
  threadId: string;
  fromAgentId: string;
  toAgentId: string | null;
  payload: unknown;
  status: "pending" | "delivered" | "ack" | "dlq";
  retries: number;
  parentId: string | null;
  createdAt: string;
}
```

### 4.2 `RoutingPolicy`

```ts
interface RoutingPolicy {
  mode: "directed_default";
  allowBroadcastTypes: string[];
  maxPayloadBytes: number;
  summaryFirst: boolean;
}
```

### 4.3 `BudgetPolicy`

```ts
interface BudgetPolicy {
  scope: "project" | "tenant";
  period: "daily" | "weekly" | "monthly";
  softThresholds: Array<{ level: "info" | "warn" | "critical"; amountUsd: number }>;
  hardCapEnabled: false; // v1
}
```

### 4.4 `UsageEvent`

```ts
interface UsageEvent {
  id: string;
  tenantId: string;
  projectId: string;
  threadId?: string;
  messageId?: string;
  agentId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  totalTokens: number;
  usageSource: "provider_exact" | "estimated";
  priceVersion: string;
  totalCostUsd: number;
  createdAt: string;
}
```

### 4.5 `AuditEvent`

```ts
interface AuditEvent {
  id: string;
  tenantId: string;
  projectId?: string;
  actorType: "user" | "project-token" | "system";
  actorId: string;
  action: string;
  result: "success" | "failure";
  metadata?: Record<string, unknown>;
  createdAt: string;
}
```

### 4.6 `PolicyDecision`

```ts
interface PolicyDecision {
  decision: "deny" | "allow" | "warn";
  policyId: string;
  reason: string;
  controls: string[];
}
```

---

## 5. Runtime invariants (decision-complete)

1. `tenantId/projectId` берутся из claims/verified context, не из пользовательского payload.
2. Любое чтение/запись Data Plane обязано быть project-scoped.
3. Cross-project read/write запрещён по guard + RLS.
4. Broadcast разрешён только для явно разрешённых системных/event payload типов.
5. Любой LLM call порождает `UsageEvent` (exact или estimated).
6. Любой policy `deny` и budget `warn/critical` порождает `AuditEvent`.
7. Для критичных операций обязателен trace context (`requestId`/`traceId`).

---

## 6. NFR profile (enterprise baseline)

1. Security:
- JWT validation mandatory;
- tenant/project isolation mandatory;
- defense-in-depth через RLS.

2. Reliability:
- at-least-once delivery;
- retry + dlq;
- определённые status transitions.

3. Latency:
- bounded read payload через summary/limit/cursor policy;
- no unbounded full-thread polling для hot paths.

4. Auditability:
- управленческие и policy события аудируются;
- cost decisions трассируются до thread/message.

5. Operability:
- метрики HTTP и usage/cost;
- budget alerts;
- runbook-ready события для инцидентов.

---

## 7. Conformance matrix

| Rule | Owner-point (где исполняется) | Verify-point (как проверяется) |
|------|-------------------------------|---------------------------------|
| Claims-only scoping | API guards + auth context | e2e cross-project mismatch tests |
| DB isolation | Postgres RLS + scoped transaction | integration tests with forced missing app filter |
| Directed-by-default routing | message send policy check | contract tests for broadcast type gating |
| Inbox amplification control | inbox/thread cursor contract | load tests + payload/read-size assertions |
| LLM usage traceability | usage ingestion hook | unit/integration tests (`provider_exact`/`estimated`) |
| Soft budget governance | budget evaluator + alerts | threshold tests (`info/warn/critical`) |
| Policy audit trail | audit writer | audit completeness checks per critical action |

---

## 8. Conformance scenarios

1. Cross-project access attempt:
- вход с валидным JWT проекта A к ресурсу проекта B;
- ожидаемо: deny (guard) и/или zero rows (RLS), audit event обязателен.

2. Broadcast overuse case:
- пользователь отправляет broadcast с неподдерживаемым `payload.type`;
- ожидаемо: policy deny или warn+audit (по policy mode).

3. Re-delivery/read amplification case:
- worker repeatedly polls без cursor;
- ожидаемо: conformance violation; требуется cursor-first путь.

4. Missing provider usage fallback case:
- provider usage отсутствует;
- ожидаемо: `usageSource=estimated`, пометка в агрегатах и audit metadata.

5. Budget threshold breach case:
- проект превышает soft threshold;
- ожидаемо: alert + audit, без hard block в v1.

---

## 9. Assumptions

1. Этот baseline не меняет runtime-код напрямую, только фиксирует целевую архитектуру и контракты.
2. Базовые инварианты JWT/RLS из ранее принятых ADR сохраняются.
3. Hard budget caps не вводятся в v1 (только soft governance).
4. Kernel intentionally минимален: продуктовые модули живут в extension layer.
