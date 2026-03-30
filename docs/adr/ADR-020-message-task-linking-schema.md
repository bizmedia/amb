# ADR-020: MessageTaskLink schema for message-to-task linking

Статус: Принято  
Дата: 2026-03-30  
Автор: Architect Agent  
PRD: [docs/PRD-message-task-linking.md](../PRD-message-task-linking.md)  
Task: AMB-0011

---

## Контекст

Нужно материализовать связь между `Message` и `Task`, когда сервер на создании сообщения извлекает `payload.tasksTouched` и разрешает task key в рамках того же `projectId`.

Решение должно:

- давать быстрые запросы `task -> messages` и `message -> tasks`;
- быть идемпотентным при повторной обработке одного и того же сообщения;
- не позволять создать связь между сущностями из разных проектов;
- работать в vNext модели с PostgreSQL + Prisma + Nest + RLS;
- не требовать backfill для исторических сообщений в v1.

Отдельно фиксируем: продуктовый scope v1 для записи связей определяется AMB-0010. Эта ADR описывает **модель данных и гарантии БД**; на уровне write-path v1 ожидается вызов только для `payload.type = "completion_report"`.

## Решение

Вводится отдельная junction-таблица `MessageTaskLink` с денормализованным `projectId` и опциональным `tenantId`.

### Почему junction-таблица

- JSON-массив ключей внутри `Message.payload` не даёт целостности и плохо индексируется для двусторонних выборок.
- Junction-модель естественно выражает many-to-many и даёт идемпотентность через уникальность пары.
- Денормализация `projectId` в таблицу связи упрощает RLS и позволяет жёстко проверить project isolation составными внешними ключами.

## Схема

### Prisma-модель

```prisma
model MessageTaskLink {
  messageId String
  taskId    String

  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  tenantId  String?
  tenant    Tenant? @relation(fields: [tenantId], references: [id], onDelete: SetNull)

  createdAt DateTime @default(now())

  message Message @relation("MessageTaskLinks", fields: [projectId, messageId], references: [projectId, id], onDelete: Cascade)
  task    Task    @relation("MessageTaskLinks", fields: [projectId, taskId], references: [projectId, id], onDelete: Cascade)

  @@id([messageId, taskId])
  @@index([projectId, taskId])
  @@index([projectId, messageId])
  @@index([tenantId, projectId])
}
```

### Обязательные изменения в существующих моделях

Для составных FK Prisma/PostgreSQL должны иметь уникальные/идентифицирующие цели:

```prisma
model Message {
  ...
  taskLinks MessageTaskLink[] @relation("MessageTaskLinks")

  @@unique([projectId, id])
}

model Task {
  ...
  messageLinks MessageTaskLink[] @relation("MessageTaskLinks")

  @@unique([projectId, id])
}

model Project {
  ...
  messageTaskLinks MessageTaskLink[]
}

model Tenant {
  ...
  messageTaskLinks MessageTaskLink[]
}
```

`@@unique([projectId, id])` на `Message` и `Task` добавляется не ради бизнес-уникальности, а как техническая цель для составных внешних ключей `([projectId, messageId])` и `([projectId, taskId])`.

## Ограничения и целостность

### Уникальность

- Каноническая уникальность: `PRIMARY KEY (messageId, taskId)`.
- Это и есть гарантия идемпотентности: одна пара сообщение-задача существует не более одного раза.
- Отдельный surrogate `id` не нужен: у сущности нет собственного жизненного цикла и нет публичного API ресурса "link".

### Project isolation

`MessageTaskLink.projectId` обязателен и должен совпадать одновременно:

- с `Message.projectId`;
- с `Task.projectId`.

Это обеспечивается не приложением, а двумя составными FK:

- `FOREIGN KEY (projectId, messageId) REFERENCES Message(projectId, id) ON DELETE CASCADE`
- `FOREIGN KEY (projectId, taskId) REFERENCES Task(projectId, id) ON DELETE CASCADE`

Следствие: строку связи физически нельзя вставить, если `messageId` и `taskId` относятся к разным проектам.

### Tenant isolation

- `tenantId` в `MessageTaskLink` денормализуется из `Project.tenantId` при вставке.
- В vNext это поле участвует в RLS как дополнительная защита в глубину, но операционной границей остаётся `projectId`.
- Так как `Task` сейчас не хранит `tenantId`, tenant-консистентность обеспечивается через `projectId -> Project -> tenantId`, а не отдельным FK на `(tenantId, taskId)`.

## Индексы

Минимальный набор индексов для v1:

- `PRIMARY KEY (messageId, taskId)`:
  устраняет дубликаты и ускоряет `message -> tasks` при точечном доступе.
- `INDEX (projectId, taskId)`:
  основной путь `task -> messages` в пределах проекта.
- `INDEX (projectId, messageId)`:
  основной путь `message -> tasks` в пределах проекта и вспомогательный для RLS-scoped join.
- `INDEX (tenantId, projectId)`:
  дешёвый фильтр для RLS и админских межтабличных запросов в hosted-модели.

Что **не** добавляем в v1:

- отдельный индекс "последнее сообщение по задаче";
- индекс по `createdAt`.

Для виджета "последнее сообщение" достаточно `JOIN MessageTaskLink -> Message` и сортировки по `Message.createdAt DESC`. Если это станет hot path, отдельный индекс или денормализация обсуждаются отдельной задачей.

## Каскады

### При удалении `Message`

- `MessageTaskLink` удаляется по `ON DELETE CASCADE`.
- Дополнительной cleanup-логики в приложении не требуется.

### При удалении `Task`

- `MessageTaskLink` удаляется по `ON DELETE CASCADE`.

### При удалении `Project`

- `MessageTaskLink` удаляется по `projectId -> Project.id` с `ON DELETE CASCADE`.
- Даже если каскад уже сработал через `Message` или `Task`, это безопасно: удаление детерминировано.

### При удалении `Tenant`

- `tenantId` в `MessageTaskLink` можно держать с `ON DELETE SET NULL`, как в `Message`/`Thread`.
- Фактическая очистка строк всё равно приходит через каскад удаления `Project`.

### При удалении `Thread`

- Таблица `MessageTaskLink` напрямую `Thread` не ссылается.
- Поведение наследуется от политики удаления `Message`.
- Отдельный FK на `Thread` не нужен.

## RLS и требования к изоляции

На `MessageTaskLink` должна быть включена RLS-политика по образцу ADR-008.

### Session context

Каждый запрос из API выполняется внутри транзакции с:

```sql
SET LOCAL app.tenant_id = '...';
SET LOCAL app.project_id = '...';
```

### Policy shape

`SELECT / UPDATE / DELETE`:

```sql
"projectId" = current_setting('app.project_id', true)
AND (
  current_setting('app.tenant_id', true) IS NULL
  OR "tenantId" IS NULL
  OR "tenantId" = current_setting('app.tenant_id', true)
)
```

`INSERT ... WITH CHECK`:

```sql
"projectId" = current_setting('app.project_id', true)
AND (
  current_setting('app.tenant_id', true) IS NULL
  OR "tenantId" IS NULL
  OR "tenantId" = current_setting('app.tenant_id', true)
)
```

Критично: `WITH CHECK` обязателен. Без него сервис с корректным `SET LOCAL` сможет случайно вставить строку не в свой проект, если когда-нибудь будет использован bypass-клиент или raw SQL.

### Почему RLS всё ещё нужна при составных FK

Составные FK защищают от **cross-project link creation**.  
RLS защищает от **утечки строк при чтении/апдейте/удалении**, если приложение пропустит `WHERE projectId = ...`.

Эти механизмы дополняют друг друга, а не заменяют.

## Требования к write-path

Вставка ссылок должна идти одним SQL-путём без N round-trip на задачу:

1. Нормализовать `tasksTouched`: trim, drop empty, dedupe.
2. Найти задачи только в рамках `message.projectId`.
3. Вставить найденные пары `messageId-taskId` батчем.
4. Использовать `ON CONFLICT (messageId, taskId) DO NOTHING`.

Рекомендуемый SQL-каркас:

```sql
INSERT INTO "MessageTaskLink" ("messageId", "taskId", "projectId", "tenantId")
SELECT
  m."id",
  t."id",
  m."projectId",
  m."tenantId"
FROM "Message" m
JOIN "Task" t
  ON t."projectId" = m."projectId"
WHERE m."id" = $1
  AND t."key" = ANY($2::text[])
ON CONFLICT ("messageId", "taskId") DO NOTHING;
```

Свойства этого подхода:

- не создаёт cross-project links;
- пропускает неизвестные ключи без ошибки;
- идемпотентен;
- хорошо ложится в post-create hook после `Message` insert.

## Последствия для nest-engineer / миграции

Нужно сделать в миграции:

1. Создать `MessageTaskLink`.
2. Добавить `@@unique([projectId, id])` на `Message`.
3. Добавить `@@unique([projectId, id])` на `Task`.
4. Создать составные FK `MessageTaskLink -> Message` и `MessageTaskLink -> Task` с `ON DELETE CASCADE`.
5. Включить RLS и политики на `MessageTaskLink`.

Чего **не** делать в AMB-0012:

- не добавлять отдельный surrogate `id`;
- не делать backfill старых сообщений;
- не поддерживать cross-project или cross-tenant links;
- не вводить дополнительную таблицу для unknown task keys.

## Open follow-ups

- Если Prisma migration неудобно выражает составные relation references декларативно, допустим raw SQL в migration, но итоговая схема БД должна остаться именно такой.
- Если позже потребуется ручное редактирование связей или атрибуты на связи (`source`, `linkedBy`, `confidence`), тогда можно обсуждать переход на surrogate `id`. Для v1 это избыточно.
