# ADR-016: Kernel Boundary and Plane Model

Статус: Предложено  
Дата: 2026-03-29

## Контекст

Архитектура продукта эволюционировала до multi-tenant hosted сервиса с несколькими слоями ответственности (auth, policy, messaging, observability, product modules). Без явно зафиксированной границы ядра команда рискует смешивать инфраструктурные и продуктовые обязанности.

Нужен каноничный ответ на вопросы:
- Что является обязательным kernel-слоем платформы?
- Как разделены Control Plane и Data Plane?
- Какие расширения допустимы, но не должны проникать в kernel?

## Решение

1. Принять kernel как `Control + Data Plane`.
2. Зафиксировать границу kernel:
- Входит: auth/rbac, policy contract, message delivery contract, routing governance, usage/cost observability, audit.
- Не входит: продуктовые доменные модули UI/PM (tasks/epics/sprints), шаблоны оркестраций и специализированные workflow-фичи.

3. Принять Plane model:
- `Control Plane`: policy, auth, audit, budget, governance.
- `Data Plane`: send/inbox/ack/dlq/retry/read.

4. Запретить смешение слоёв:
- Product modules не могут диктовать kernel contracts.
- Kernel API не зависит от UI-модулей и их внутренней логики.

## Рассмотренные альтернативы

1. Messaging-only kernel:
- Плюсы: минимальная поверхность ядра.
- Минусы: governance, cost и policy становятся разрозненными и неканоничными.

2. Full-platform kernel:
- Плюсы: единый «монолитный» контракт.
- Минусы: слишком широкая зона ядра, высокая связность, медленная эволюция.

## Последствия

1. Архитектурные решения должны ссылаться на plane ownership (Control/Data).
2. Любое расширение продуктовой области оформляется как extension поверх kernel contracts.
3. Упрощается аудит соответствия (что kernel, а что product layer).

## Acceptance gates

1. Существует единый kernel документ с boundary + plane model.
2. Каждый новый ADR указывает, к какому plane относится решение.
3. В документации есть явный список запретов смешения слоёв.
4. Extension-модули не вводят обязательные зависимости для kernel.
