# Multi-tenant архитектура для productized NestJS API — варианты и рекомендации

Дата: 2026-01-28

Источник: `docs/productization-multi-tenant-nestjs.md`

## Контекст и допущения

- Контекст доступа определяется строго из JWT claims: `tenantId` + `projectId`.
- Все доменные сущности и таблицы шины сообщений должны быть **project-scoped** (и, при необходимости, денормализованы `tenantId`).
- Dashboard (Next.js) **не имеет прямого доступа к БД** и общается с `apps/api` только по HTTP.
- Цель multi-tenant: безопасно обслуживать несколько tenant’ов и несколько projects в каждом tenant’e одним инстансом сервиса.

## Варианты multi-tenancy

### Вариант A — Shared DB, shared schema, app-level scoping

**Модель изоляции:** одна БД/схема; во всех рабочих таблицах есть `tenantId` + `projectId` (денормализация). Фильтрация и проверки выполняются на уровне приложения (guards/repository) по контексту из JWT.

**Плюсы**
- Быстро внедряется, минимум инфраструктуры; работает и с SQLite, и с Postgres.
- Наиболее прямолинейно совместим с Prisma (без специфических трюков с соединениями/контекстом).
- Хорошо подходит для ранних фаз и миграции эндпойнтов 1:1 без изменения доменной модели.

**Минусы**
- Главный риск: утечка данных при ошибке в любом запросе (отсутствует defense-in-depth).
- Требует жёсткой дисциплины в доступе к данным и полной тест-матрицы на tenant isolation.

**Когда выбирать:** MVP/быстрый старт, или если целевой движок БД остаётся SQLite.

---

### Вариант B — Shared Postgres + RLS (рекомендуемая целевая архитектура)

**Модель изоляции:** одна БД/схема (Postgres); строки содержат `tenantId`/`projectId`. Включены RLS-политики, которые используют контекст соединения:

- `current_setting('app.tenant_id', true)`
- `current_setting('app.project_id', true)`

В `apps/api` для каждого запроса/джобы выставляется контекст БД через `SET LOCAL ...` **в той же транзакции и том же соединении**, в котором выполняются запросы Prisma (scoped transaction pattern).

**Плюсы**
- Defense-in-depth: БД предотвращает чтение/запись чужих строк даже при баге в коде.
- Явная фиксация security boundary на уровне данных (полезно для compliance/enterprise).
- Существенно снижает вероятность критических инцидентов tenant isolation.

**Минусы**
- Требует Postgres и аккуратной интеграции Prisma + транзакции + пул соединений.
- Нужно заранее продумать админские операции и фоновые джобы (например, роль с `BYPASSRLS` или отдельные admin policies).
- Нужен строгий стандарт: «запросы к рабочим таблицам выполняются только внутри scoped transaction».

**Когда выбирать:** продакшен multi-tenant, где tenant isolation — P0 риск.

---

### Вариант C — DB-per-tenant (или schema-per-tenant)

**Модель изоляции:** у каждого tenant — отдельная БД (или отдельная schema в одном Postgres). Контекст из JWT выбирает целевое соединение/клиент.

**Плюсы**
- Максимальная физическая изоляция данных; проще рассуждать о безопасности.
- Можно дифференцировать ресурсы/квоты/бэкапы по tenant.

**Минусы**
- Высокая операционная стоимость: миграции, бэкапы, мониторинг и управление подключениями для каждого tenant.
- Сложнее provisioning (создание tenant), а также admin plane.
- Prisma со schema-per-tenant/динамическими схемами обычно требует нетривиальных решений; DB-per-tenant может привести к множеству клиентов/пулов.

**Когда выбирать:** enterprise-tier сценарии с требованиями физической изоляции и бюджетом на ops.

## Рекомендация

Двигаться фазами **A → B**:

1) В фазах миграции и раннего MVP использовать **вариант A** (app-level scoping), но сразу:
   - хранить `tenantId`/`projectId` в строках,
   - строить репозитории/guards вокруг строгого контекста из JWT,
   - покрыть tenant isolation тестами.
2) Целевым решением перед публичным релизом зафиксировать **вариант B** (Postgres + RLS), как defense-in-depth.
3) Вариант C оставить как «future/enterprise tier», если появятся требования на физическую изоляцию.

## Риски и меры

### Риск: регресс tenant isolation (критический)

**Меры**
- Зафиксировать вариант B (RLS) как целевую защиту.
- Ввести тест-матрицу: «нельзя читать/писать чужой `projectId`/`tenantId`» для ключевых эндпойнтов и репозиториев.
- Запретить прямые Prisma-запросы вне scoped transaction helper (и в HTTP-обработчиках, и в workers).

### Риск: Prisma + RLS контекст не в том соединении

**Меры**
- Стандартизировать helper вида `withProjectScope(prisma, { tenantId, projectId }, fn)`, который:
  - открывает транзакцию,
  - делает `SET LOCAL app.tenant_id = ...; SET LOCAL app.project_id = ...;`,
  - выполняет `fn` внутри этой транзакции.
- Зафиксировать правило в документации и код-ревью: «нет raw Prisma вызовов вне scope».

### Риск: admin/worker операции требуют кросс-проектного доступа

**Меры**
- Отдельная DB роль/соединение для админских задач (`BYPASSRLS`) либо явные admin policies.
- В очередях/джобах хранить `tenantId/projectId` и всегда устанавливать scope перед запросами.

## ADR, которые нужно зафиксировать (до активной разработки)

1) **Multi-tenancy isolation model (A/B/C)**  
   Решение: target = B (Postgres + RLS), fallback = A, future = C.
2) **Database engine for product**  
   Решение: Postgres для prod (если RLS обязательна); SQLite допустим только для dev/demo.
3) **Request/job DB scoping mechanism**  
   Решение: scoped transaction helper + `SET LOCAL app.tenant_id/app.project_id`; запрет запросов вне scope.
4) **JWT claims + token types**  
   Решение: user tokens vs service tokens; обязательные `tenantId/projectId`; правила expiry/rotation.
5) **Authorization model for admin plane**  
   Решение: роли (например, `tenant-admin`, `project-admin`, `reader`) и контракт admin endpoints (tenants/projects/tokens).
6) **Background workers scope and sharding**  
   Решение: единый worker vs шардирование по tenant/project; правила блокировок/лимитов/очередей.

## Предлагаемые следующие шаги (spike)

Если подтверждаем вариант B как target:

1) Оформить ADR по **DB + RLS + scoped transaction**.
2) Сделать spike на одном эндпойнте: Prisma transaction + `SET LOCAL` + интеграционные тесты tenant isolation.
3) После подтверждения паттерна — распространить на все репозитории/эндпойнты и на workers.

