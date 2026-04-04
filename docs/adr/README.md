# Указатель ADR

В этой папке хранятся записи об архитектурных решениях (Architecture Decision Records, ADR).

Соглашение по именованию:

- `ADR-XXX-<kebab-title>.md`

## Triage ADR-015–019

Итог разбора (архитектор): зонтичный **ADR-015** разбит на **ADR-016–019**; последние **приняты** как канон enterprise kernel baseline.

| ADR | Triage | Статус в репозитории |
|-----|--------|----------------------|
| [ADR-015](./ADR-015-llm-cost-observability-and-routing-efficiency.md) | **Разбить** → дочерние ADR-016…019; тело ADR-015 = справочный план внедрения | Разбито |
| [ADR-016](./ADR-016-kernel-boundary-and-plane-model.md) | **Принять** — граница kernel, Control/Data Plane | Принято |
| [ADR-017](./ADR-017-enterprise-rules-and-policy-contract.md) | **Принять** — контракт policy и точки enforcement | Принято |
| [ADR-018](./ADR-018-llm-cost-observability-soft-budgets.md) | **Принять** — usage/cost, soft budgets v1 | Принято |
| [ADR-019](./ADR-019-routing-efficiency-and-broadcast-governance.md) | **Принять** — маршрутизация, broadcast, cursor-first | Принято |

**Отклонено:** ни один из ADR-015…019 не отклонён целиком.

Полный отчёт о выполнении: [completion-report-adr-015-019.md](./completion-report-adr-015-019.md).

## Принятые ADR

| ADR | Название | Дата | Статус |
|-----|----------|------|--------|
| [ADR-005](./ADR-005-nestjs-backend.md) | Backend на Nest.js | 2026-01-28 | Принято |
| [ADR-006](./ADR-006-multi-tenant-model.md) | Модель Multi-Tenant | 2026-01-28 | Принято |
| [ADR-007](./ADR-007-jwt-and-project-tokens.md) | JWT Auth | 2026-01-28 | Принято |
| [ADR-008](./ADR-008-postgres-rls.md) | PostgreSQL RLS | 2026-01-28 | Принято |
| [ADR-009](./ADR-009-hosting-and-infrastructure.md) | Хостинг и инфраструктура | 2026-01-28 | Принято |
| [ADR-010](./ADR-010-user-authentication.md) | Аутентификация пользователей | 2026-01-28 | Принято |
| [ADR-011](./ADR-011-rbac-model.md) | Модель RBAC | 2026-01-28 | Принято |
| [ADR-012](./ADR-012-project-token-issuance.md) | Механика выдачи project-токенов | 2026-01-28 | Принято |
| [ADR-013](./ADR-013-workers-architecture.md) | Архитектура фоновых воркеров | 2026-01-28 | Принято |
| [ADR-014](./ADR-014-issue-keys-epics-sprints.md) | Issue Keys, Epics & Sprints | 2026-03-26 | Принято |
| [ADR-016](./ADR-016-kernel-boundary-and-plane-model.md) | Kernel Boundary and Plane Model | 2026-03-29 | Принято |
| [ADR-017](./ADR-017-enterprise-rules-and-policy-contract.md) | Enterprise Rules and Policy Engine Contract | 2026-03-29 | Принято |
| [ADR-018](./ADR-018-llm-cost-observability-soft-budgets.md) | LLM Usage Cost Observability and Soft Budgets | 2026-03-29 | Принято |
| [ADR-019](./ADR-019-routing-efficiency-and-broadcast-governance.md) | Routing Efficiency and Broadcast Governance | 2026-03-29 | Принято |

## Разбитые ADR

| ADR | Название | Дата | Статус | Дочерние записи / замена |
|-----|----------|------|--------|---------------------------|
| [ADR-015](./ADR-015-llm-cost-observability-and-routing-efficiency.md) | LLM Cost Observability и оптимизация маршрутизации | 2026-03-28 | Разбито | [ADR-016](./ADR-016-kernel-boundary-and-plane-model.md) (граница kernel и модель плоскостей), [ADR-017](./ADR-017-enterprise-rules-and-policy-contract.md) (policy contract), [ADR-018](./ADR-018-llm-cost-observability-soft-budgets.md) (usage/cost и soft budgets), [ADR-019](./ADR-019-routing-efficiency-and-broadcast-governance.md) (маршрутизация, broadcast, cursor-first, guardrails) |

## Принятые ADR-016–019: acceptance gates, kernel и плоскости

Каноничный baseline: [Kernel Architecture (Enterprise)](../architecture/kernel-architecture-enterprise.md).

| ADR | Acceptance gates (кратко) | Kernel | Control Plane | Data Plane |
|-----|---------------------------|--------|---------------|------------|
| **016** | Единый kernel-документ; новые ADR указывают plane; запрет смешения слоёв; extensions не обязуют kernel | Да: граница mandatory kernel и модель Control/Data Plane; перечень возможностей — в enterprise baseline | Политика, auth, audit, budget, governance — часть kernel | send/inbox/ack/dlq/retry/read — часть kernel |
| **017** | Контракт `PolicyDecision`; enforcement points; приоритет deny > warn > allow; аудит deny и warn (cost/security) | Да: централизованное исполнение policy | Да: оценка и аудит решений | Точки вызова policy при операциях Data Plane (send/inbox/worker) |
| **018** | exact → estimated; минимальная usage-схема и linkage; soft budget info/warn/critical; минимум агрегатов UI/API | Да: трассируемость LLM cost/usage | Да: сбор, агрегаты, soft budgets, алерты | Хуки записи usage на пути исполнения вызовов |
| **019** | Directed-by-default и условия broadcast; cursor-first retrieval; лимиты payload/summary; KPI эффективности маршрутизации | Да: routing governance + контракт доставки | Политика маршрутизации, метрики, guardrails | Инкрементальные inbox/thread reads, семантика доставки |

## Предложенные ADR

_(нет записей в статусе «Предложено».)_

## Шаблон ADR

```markdown
# ADR-XXX: Название

Статус: Предложено | Принято | Отклонено | Устарело | Разбито  
Дата: ГГГГ-ММ-ДД

## Контекст

## Решение

## Рассмотренные альтернативы

## Последствия

## Acceptance gates
```
