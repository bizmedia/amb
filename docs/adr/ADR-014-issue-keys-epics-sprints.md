# ADR-014: Issue Keys, Epics & Sprints — архитектурные решения

Статус: Принято  
Дата: 2026-03-26  
Автор: Architect Agent  
PRD: [docs/PRD-issue-keys-epics-sprints.md](../PRD-issue-keys-epics-sprints.md)  
Epics: E9A, E9B, E9C

---

## Контекст

PRD v1.0 вводит три крупных расширения модуля задач:

1. **Project task prefix + issue key** (`PPP-0001`) — человекочитаемые идентификаторы задач
2. **Epics** — группировка задач по крупным инициативам
3. **Sprints** — планирование задач по временным итерациям

Перед началом разработки требуется зафиксировать архитектурные решения по пяти ключевым вопросам, выявленным в ходе декомпозиции (E9A, E9B, E9C).

---

## Решение 1: Concurrency Strategy для Key Generation (E9A-009)

### Проблема

При параллельном создании задач несколькими агентами (или пользователями) нужно гарантировать уникальность последовательных номеров. Application-level lock недопустим — возможны race conditions.

### Рассмотренные варианты

| # | Вариант | Плюсы | Минусы |
|---|---------|-------|--------|
| A | **Optimistic lock** (read → increment → write, retry on conflict) | Простой код | Retry-loop при конкуренции; нет гарантии без версионирования |
| B | **`UPDATE ... RETURNING`** (атомарный increment в одном SQL-запросе) | Атомарность на уровне БД; одна операция; нет retry | Сырой SQL через `$executeRawUnsafe` / `$queryRawUnsafe` в Prisma |
| C | **PostgreSQL SEQUENCE** (отдельная sequence per project) | Нативная конкурентная безопасность PostgreSQL | Динамическое создание/удаление sequences при создании проектов; DDL в runtime; усложнение миграций и backfill |

### Решение: Вариант B — `UPDATE ... RETURNING`

Атомарный инкремент `Project.taskSequence` через сырой SQL в Prisma-транзакции:

```sql
UPDATE "Project"
SET "taskSequence" = "taskSequence" + 1
WHERE "id" = $1
RETURNING "taskSequence", "taskPrefix";
```

Этот запрос в рамках транзакции Prisma (`$transaction`) с RLS-контекстом:

1. Атомарно увеличивает счётчик
2. Возвращает новое значение и текущий prefix
3. Из результата формируется key: `{taskPrefix}-{String(taskSequence).padStart(4, '0')}`
4. Key записывается в создаваемую Issue

Row-level lock (`FOR UPDATE` неявно через `UPDATE`) гарантирует, что параллельные транзакции сериализуются на строке Project.

### Последствия

- `$queryRawUnsafe` / `$executeRawUnsafe` в Prisma — допустимо, т.к. параметр `$1` передаётся как bind parameter (нет SQL-injection)
- Вся операция создания issue обернута в одну транзакцию: `SET LOCAL` RLS → `UPDATE Project RETURNING` → `INSERT Issue` → commit
- При откате транзакции номер не «сгорает» — счётчик не был реально увеличен
- Нет зависимости от DDL в runtime (в отличие от SEQUENCE per project)

---

## Решение 2: Backfill Strategy для Historical Issues и Prefix (E9A-005)

### Проблема

При применении миграции существующие проекты не имеют `taskPrefix`, а существующие issues не имеют `key`. Нужна стратегия для:
- Генерации prefix для существующих проектов
- Назначения keys для всех исторических issues

### Решение

#### 2a. taskPrefix для существующих проектов

**Auto-generate из `slug`**: при миграции генерировать prefix из первых 3 символов `slug` в uppercase. Если возникает конфликт уникальности в рамках tenant — добавлять цифровой суффикс (например `AMB` → `AMB1` → `AMB2`).

Реализация — data migration script (Prisma seed или SQL-скрипт в миграции):

```sql
-- Pseudo-code для data migration
WITH ranked AS (
  SELECT id, "tenantId",
    UPPER(LEFT(slug, 3)) AS candidate,
    ROW_NUMBER() OVER (PARTITION BY "tenantId", UPPER(LEFT(slug, 3)) ORDER BY "createdAt") AS rn
  FROM "Project"
  WHERE "taskPrefix" IS NULL
)
UPDATE "Project" p
SET "taskPrefix" = CASE
  WHEN r.rn = 1 THEN r.candidate
  ELSE r.candidate || (r.rn - 1)::text
END
FROM ranked r
WHERE p.id = r.id;
```

После backfill — сделать поле `taskPrefix` обязательным (`NOT NULL`) и добавить unique constraint `@@unique([tenantId, taskPrefix])`.

**Обоснование:** автоматическая генерация вместо ручной установки — проекты сразу получают рабочий prefix без блокировки системы. Администратор может изменить prefix позже через settings UI.

#### 2b. keys для исторических issues

**Порядок назначения: по `createdAt` ASC.** Для каждого проекта:

1. Выбрать все issues без `key`, отсортированные по `createdAt ASC`
2. Для каждого issue назначить следующий порядковый номер
3. Обновить `Project.taskSequence` до финального значения

Реализация — единый SQL в data migration:

```sql
WITH numbered AS (
  SELECT i.id,
    ROW_NUMBER() OVER (PARTITION BY i."projectId" ORDER BY i."createdAt") AS seq
  FROM "Issue" i
  WHERE i."key" IS NULL
)
UPDATE "Issue" i
SET "key" = p."taskPrefix" || '-' || LPAD(n.seq::text, 4, '0')
FROM numbered n
JOIN "Project" p ON p.id = i."projectId"
WHERE i.id = n.id;

-- Обновить taskSequence проекта
UPDATE "Project" p
SET "taskSequence" = COALESCE(sub.max_seq, 0)
FROM (
  SELECT "projectId", COUNT(*) AS max_seq
  FROM "Issue"
  WHERE "key" IS NOT NULL
  GROUP BY "projectId"
) sub
WHERE p.id = sub."projectId";
```

После backfill — сделать поле `key` обязательным (`NOT NULL`) и добавить unique constraint `@@unique([projectId, key])`.

### Последствия

- Миграция должна выполняться в одной транзакции для консистентности
- Для больших объёмов (>100k issues) — batch update с `LIMIT` и повторением
- Порядок по `createdAt` — интуитивный и воспроизводимый; задача, созданная раньше, получает меньший номер
- Auto-generated prefix может быть неочевидным для пользователя — документировать в release notes

---

## Решение 3: Max 1 ACTIVE Sprint Constraint (E9C-004)

### Проблема

В проекте одновременно может быть не более одного спринта со статусом `ACTIVE`. Нужно выбрать уровень enforcement: DB или application.

### Рассмотренные варианты

| # | Вариант | Плюсы | Минусы |
|---|---------|-------|--------|
| A | **Partial unique index** (`CREATE UNIQUE INDEX ... WHERE status = 'ACTIVE'`) | Гарантия на уровне БД; невозможно обойти через прямой SQL | Prisma не поддерживает partial unique index декларативно; требуется raw SQL migration |
| B | **Application-level validation** (проверка в service перед `start`) | Простота; нативный Prisma-код | Race condition при параллельных запросах; нет гарантии на уровне БД |
| C | **Оба уровня** (application + partial index как safety net) | Максимальная надёжность; user-friendly ошибки в API + невозможность обхода на уровне БД | Два места поддержки логики |

### Решение: Вариант C — Application-level validation + Partial Unique Index

**Application layer** (в `SprintsService.start()`):

```typescript
const active = await prisma.sprint.findFirst({
  where: { projectId, status: 'ACTIVE' },
});
if (active) {
  throw new ConflictException('Project already has an active sprint');
}
```

**Database layer** (в Prisma migration, raw SQL):

```sql
CREATE UNIQUE INDEX "Sprint_projectId_active_unique"
ON "Sprint" ("projectId")
WHERE "status" = 'ACTIVE';
```

В `schema.prisma` добавить комментарий, что partial index создаётся в ручной миграции.

### Последствия

- Application-level — user-friendly сообщение об ошибке (409 Conflict)
- DB-level — safety net от race conditions и прямых SQL-операций
- Partial index не описывается в `schema.prisma` — нужен кастомный SQL в миграции и комментарий `// See migration XXXX for partial unique index on Sprint`
- При `prisma migrate` новые миграции не затирают кастомный index (Prisma сохраняет неизвестные объекты в diff)

---

## Решение 4: Epic Deletion vs Archival (E9B-010)

### Проблема

При удалении эпика нужно решить, что происходит с привязанными issues и данными эпика.

### Рассмотренные варианты

| # | Вариант | Плюсы | Минусы |
|---|---------|-------|--------|
| A | **Hard delete** + nullify `Issue.epicId` | Простота; чистая БД | Потеря информации; нет возможности восстановления |
| B | **Soft archive** (status → `ARCHIVED`) | Данные сохраняются; можно восстановить; issues остаются привязанными | Архивные эпики нужно фильтровать в UI и API; усложняется отображение |
| C | **Soft archive + unlink issues** | Архив данных; issues свободны для переназначения | Потеря связи issue→epic при архивации |

### Решение: Вариант B — Soft Archive (status → ARCHIVED)

`DELETE /api/epics/:id` реализуется как **soft archive**:

1. Статус эпика переводится в `ARCHIVED`
2. Issues **остаются привязанными** к эпику (для истории)
3. Архивированные эпики **не отображаются** в дропдаунах назначения по умолчанию
4. В списке эпиков — скрыты за фильтром (по умолчанию `status != ARCHIVED`)
5. Назначение issue в архивированный эпик **запрещено** на уровне API

Endpoint `DELETE /api/epics/:id` переименовать семантически в `PATCH /api/epics/:id` с `{ status: 'ARCHIVED' }`. При этом для удобства допустим shortcut `DELETE /api/epics/:id` = archive.

**Hard delete** — отдельная операция для администраторов (если потребуется в будущем). В MVP не реализуется.

### Последствия

- EpicStatus enum: `OPEN`, `IN_PROGRESS`, `DONE`, `ARCHIVED` — архивация через стандартный статусный переход
- Фильтры по умолчанию исключают `ARCHIVED` — пользователь не видит устаревшие эпики
- Данные сохраняются — возможен откат (переход из `ARCHIVED` обратно в `OPEN`)
- Привязка issues к архивному эпику сохраняется как историческая запись; при необходимости пользователь может вручную убрать привязку
- SDK метод `client.epics.delete(id)` фактически делает archive

---

## Решение 5: taskPrefix Backfill для существующих проектов

### Проблема

После миграции существующие проекты не имеют `taskPrefix`. Система должна определить, как эти проекты получают prefix: автоматически или вручную.

### Решение: Auto-generate + возможность ручного изменения

Объединяется с Решением 2a. Стратегия:

1. **При миграции** — автоматическая генерация из `slug` (первые 3 символа, uppercase)
2. **После миграции** — поле становится `NOT NULL`; все проекты имеют prefix
3. **В settings UI** — администратор может изменить prefix на любой валидный (2-5 uppercase Latin), уникальный в рамках tenant
4. **Для новых проектов** — prefix обязателен при создании; предложение по умолчанию генерируется из имени проекта

### Валидация prefix

```
/^[A-Z]{2,5}$/
```

- Минимум 2, максимум 5 символов
- Только латинские заглавные буквы
- Уникальность в рамках tenant: `@@unique([tenantId, taskPrefix])`

### Миграция (порядок шагов)

1. `ALTER TABLE "Project" ADD COLUMN "taskPrefix" VARCHAR(5) NULL`
2. `ALTER TABLE "Project" ADD COLUMN "taskSequence" INT DEFAULT 0 NOT NULL`
3. Выполнить data migration (auto-generate prefixes из slug)
4. `ALTER TABLE "Project" ALTER COLUMN "taskPrefix" SET NOT NULL`
5. `CREATE UNIQUE INDEX ... ON "Project" ("tenantId", "taskPrefix")`
6. `ALTER TABLE "Issue" ADD COLUMN "key" VARCHAR(10) NULL`
7. Выполнить data migration (assign keys to historical issues)
8. `ALTER TABLE "Issue" ALTER COLUMN "key" SET NOT NULL`
9. `CREATE UNIQUE INDEX ... ON "Issue" ("projectId", "key")`

### Последствия

- Zero-downtime: поля добавляются как nullable, заполняются, затем делаются NOT NULL
- Администратору сообщается через release notes, что prefix был сгенерирован автоматически и может быть изменён
- Смена prefix не затрагивает существующие keys (PRD §4: «Смена project prefix — разрешена только для будущих задач; существующие keys не меняются»)

---

## Дополнительные архитектурные заметки

### Модель данных: расширение schema.prisma

```prisma
// Project — новые поля
model Project {
  // ... existing fields ...
  taskPrefix   String?    // → NOT NULL после backfill; 2-5 uppercase Latin
  taskSequence Int        @default(0)

  epics   Epic[]
  sprints Sprint[]

  @@unique([tenantId, taskPrefix])
}

// Issue — новые поля
model Issue {
  // ... existing fields ...
  key       String?     // → NOT NULL после backfill; формат PPP-0001
  epicId    String?
  epic      Epic?       @relation(fields: [epicId], references: [id], onDelete: SetNull)
  sprintId  String?
  sprint    Sprint?     @relation(fields: [sprintId], references: [id], onDelete: SetNull)

  @@unique([projectId, key])
  @@index([epicId])
  @@index([sprintId])
}

enum EpicStatus {
  OPEN
  IN_PROGRESS
  DONE
  ARCHIVED
}

model Epic {
  id          String     @id @default(uuid())
  projectId   String
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title       String
  description String?
  status      EpicStatus @default(OPEN)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  issues      Issue[]

  @@index([projectId])
  @@index([projectId, status])
}

enum SprintStatus {
  PLANNED
  ACTIVE
  COMPLETED
}

model Sprint {
  id        String       @id @default(uuid())
  projectId String
  project   Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name      String
  goal      String?
  startDate DateTime?
  endDate   DateTime?
  status    SprintStatus @default(PLANNED)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  issues    Issue[]

  @@index([projectId])
  @@index([projectId, status])
  // Partial unique index: see migration for
  // CREATE UNIQUE INDEX ON "Sprint" ("projectId") WHERE status = 'ACTIVE'
}
```

### RLS

Новые модели (Epic, Sprint) — project-scoped. RLS-политики аналогичны Issue:
- `USING ("projectId" = current_setting('app.project_id')::uuid)`
- Для операций записи: `WITH CHECK ("projectId" = current_setting('app.project_id')::uuid)`

### Порядок реализации

```
E9A Phase 1 (DB)
  ↓
E9A Phase 2 (API)  →  E9A Phase 3 (SDK)
  ↓                    ↓
E9B Phase 1 (DB)     E9A Phase 4 (Frontend)
  ↓
E9B Phase 2 (API)  →  E9B Phase 3 (SDK)
  ↓                    ↓
E9C Phase 1 (DB)     E9B Phase 4 (Frontend)
  ↓
E9C Phase 2 (API)  →  E9C Phase 3 (SDK)
                       ↓
                     E9C Phase 4 (Frontend)
```

---

## Связанные ADR

| ADR | Связь |
|-----|-------|
| ADR-005 | Nest.js backend — API для новых эндпоинтов |
| ADR-006 | Multi-tenant model — taskPrefix уникален per tenant |
| ADR-008 | PostgreSQL RLS — Epic, Sprint project-scoped |
| ADR-013 | Workers — не затрагивается; воркеры не взаимодействуют с epics/sprints |
