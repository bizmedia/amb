# Указатель ADR

В этой папке хранятся записи об архитектурных решениях (Architecture Decision Records, ADR).

Соглашение по именованию:

- `ADR-XXX-<kebab-title>.md`

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

## Предложенные ADR

| ADR | Название | Дата | Статус |
|-----|----------|------|--------|
| [ADR-015](./ADR-015-llm-cost-observability-and-routing-efficiency.md) | LLM Cost Observability и оптимизация маршрутизации | 2026-03-28 | Предложено |
| [ADR-016](./ADR-016-kernel-boundary-and-plane-model.md) | Kernel Boundary and Plane Model | 2026-03-29 | Предложено |
| [ADR-017](./ADR-017-enterprise-rules-and-policy-contract.md) | Enterprise Rules and Policy Engine Contract | 2026-03-29 | Предложено |
| [ADR-018](./ADR-018-llm-cost-observability-soft-budgets.md) | LLM Usage Cost Observability and Soft Budgets | 2026-03-29 | Предложено |
| [ADR-019](./ADR-019-routing-efficiency-and-broadcast-governance.md) | Routing Efficiency and Broadcast Governance | 2026-03-29 | Предложено |

## Шаблон ADR

```markdown
# ADR-XXX: Название

Статус: Предложено | Принято | Отклонено | Устарело  
Дата: ГГГГ-ММ-ДД

## Контекст

## Решение

## Рассмотренные альтернативы

## Последствия

## Acceptance gates
```
