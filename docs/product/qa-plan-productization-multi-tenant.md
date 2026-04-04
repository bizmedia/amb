# QA Plan — Productization Multi‑Tenant (NestJS)

Дата: 2026-01-28  
Статус: draft

Цель: определить минимальную QA матрицу и тест-уровни для MVP vNext, с фокусом на tenant/project isolation и auth.

См. также: `docs/product/productization-multi-tenant-implementation-plan.md`.

---

## Ключевые QA риски (P0)

1) **Tenant/Project isolation** (в коде и в Postgres RLS), отсутствие выбора проекта через header/query.
2) **AuthN/AuthZ**: user vs project/service tokens, истечение токенов, revoke/rotation.
3) **Миграция/backfill**: default tenant/project и корректное заполнение `tenantId/projectId`.
4) **Семантика inbox/DLQ/retry/ack** в пределах project scope.

---

## Принятые продуктовые решения, влияющие на тесты

- `/v1` only.
- User access-token содержит ровно один `projectId`; смена проекта = новый access-token.
- Project/service tokens = JWT + DB-backed быстрый revoke (по `jti`/id).
- Retention/cleanup (TTL) = P1 (но P0 закладывает hooks/поля).
- Rate limiting = P1 (поднять в P0 для external beta/public).
- Audit minimum = token issue/revoke, tenant/project create/update, DLQ retry/retry-all.

---

## Уровни тестов

1) **Unit**
- Парсинг/валидация JWT claims, guards/policies.
- Хелперы project scoping и инварианты (no projectId from request).

2) **Integration (основное для P0)**
- API + DB (Prisma) + Postgres RLS policies.
- Миграции/backfill (проверка на существующих данных).
- Изоляция: cross-project доступ блокируется кодом и/или БД.

3) **E2E**
- Web→API сценарии: login, project switch (новый token), inbox/DLQ/retry.

4) **Regression suite**
- send/inbox/ack/DLQ/retry + изоляция + revoke/rotation.

---

## Минимальная матрица MVP (ключевые сценарии)

### Auth / Permissions

- User token: доступ только к `projectId` из claims.
- Project/service token: доступ только в своём project (набор операций зависит от ролей/дизайна).
- Token без нужных claims/неверный тип/истёкший: `401`.

### Project switching (Dashboard)

- UI switch project → получение нового access-token.
- Старый token **не даёт** доступ к данным нового project.
- Любые попытки «подменить projectId» через URL/body/headers игнорируются или приводят к ошибке; фактический scope только из claims.

### Isolation (Defense-in-depth)

Для каждой ключевой операции (read/write):
- Попытка получить/ack/retry message из другого project → `404/403` на уровне API **и** (при включённом RLS) 0 rows / permission denied на уровне БД.

### DLQ / Retry

- Сообщение → fail → DLQ; retry возвращает в обработку только в рамках project.
- Retry не создаёт нежелательных дубликатов сверх спецификации (инвариант нужно зафиксировать в контракте).

### Migration / Backfill

- После backfill все существующие строки имеют `tenantId/projectId`.
- Данные доступны в default project; orphan records отсутствуют.
- Миграции применяются на пустой БД и на «существующих данных».

### Audit minimum

- token issued/revoked → запись аудита с `tenantId/projectId`, actor, timestamp, correlation/request id.
- tenant/project create/update → запись аудита.
- DLQ retry/retry-all → запись аудита.
- События не «протекают» между проектами.

---

## Нефункциональные проверки (smoke)

- Performance-smoke: базовые метрики на N сообщений (без security/pentest).
- Reliability: повторные retry не ломают инварианты и не создают неожиданные дубликаты.

---

## Где хранить артефакты

- Этот QA план: `docs/product/qa-plan-productization-multi-tenant.md`.
- Тест-кейсы/таблицы (если потребуется детализация): можно расширить этот файл или добавить `docs/qa/` по решению команды.

