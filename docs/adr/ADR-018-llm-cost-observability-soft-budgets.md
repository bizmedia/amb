# ADR-018: LLM Usage Cost Observability and Soft Budgets

Статус: Предложено  
Дата: 2026-03-29

## Контекст

Продукт опирается на multi-agent workflow, где стоимость LLM становится критичной операционной метрикой. Для enterprise-эксплуатации нужно видеть cost по проектам/тредам/агентам и управлять перерасходом без блокировки рабочих процессов в v1.

## Решение

1. Source of truth для токенов/cost:
- `provider_exact` usage — основной источник.
- `estimated` — fallback, если провайдер не вернул usage.

2. Принять минимальный usage schema (contract-level):
- provider, model, requestType, usageSource;
- input/output/cached/reasoning/total tokens;
- total cost + priceVersion;
- thread/message/agent/project linkage.

3. Принять soft budget policy для v1:
- пороги `info/warn/critical`;
- действия: alert + audit + observability event;
- hard block отключён в v1.

4. Принять UI-агрегаты (minimum):
- total cost/tokens;
- by-thread, by-agent, by-model, by-day;
- доля `provider_exact` vs `estimated`.

## Рассмотренные альтернативы

1. Hard budget caps в v1:
- Плюсы: строгий контроль расходов.
- Минусы: риск остановки рабочих процессов в критический момент.

2. Отчёты без policy:
- Плюсы: минимальная сложность.
- Минусы: нет автоматической реакции на перерасход.

## Последствия

1. Cost observability становится mandatory capability Control Plane.
2. Runtime должен уметь писать usage-события для каждого LLM вызова.
3. В v1 бюджет управляется предупреждениями, не запретами.

## Acceptance gates

1. В документации закреплён fallback-порядок exact → estimated.
2. Определён минимальный usage schema и обязательные поля linkage.
3. Зафиксированы soft budget уровни и их реакции.
4. Указан minimum набор cost-агрегатов для UI/API.
