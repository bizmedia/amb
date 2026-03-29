# ADR-019: Routing Efficiency and Broadcast Governance

Статус: Предложено  
Дата: 2026-03-29

## Контекст

Текущая message-модель поддерживает broadcast (`toAgentId = null`), что упрощает массовую рассылку, но увеличивает риск token burn и read amplification. Для enterprise-профиля нужно зафиксировать правила маршрутизации и ограничения.

## Решение

1. Принять routing default:
- Directed messaging по умолчанию.
- Broadcast разрешён только для разрешённых system/event типов.

2. Принять retrieval strategy:
- inbox и thread reads в режиме cursor-first;
- инкрементальное чтение вместо полного перечитывания истории на каждом poll.

3. Принять anti-amplification guardrails:
- payload size limits;
- summary-first policy для массовых списков;
- details-on-demand для полного контента.

4. Принять governance-метрики маршрутизации:
- broadcast ratio;
- avg recipients per message;
- redelivery rate;
- read amplification indicator.

## Рассмотренные альтернативы

1. Полный запрет broadcast:
- Плюсы: минимизация fan-out.
- Минусы: теряется полезный системный паттерн уведомлений.

2. Broadcast без ограничений:
- Плюсы: простая модель.
- Минусы: неконтролируемый рост стоимости и лишний контекст для агентов.

## Последствия

1. Маршрутизация становится управляемой policy-областью, а не свободным выбором клиента.
2. Снижается ненужная доставка и повторное чтение контекста.
3. Появляется база для SLO по эффективности обмена сообщениями.

## Acceptance gates

1. Зафиксирован directed-by-default и условия допустимого broadcast.
2. Cursor-first retrieval стратегия закреплена как целевая.
3. Определены payload/summary guardrails.
4. Определён набор routing efficiency KPI для observability.
