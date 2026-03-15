# Справочник API

Полная документация API для Agent Message Bus.

## Base URL

Все API endpoints имеют префикс `/api`:

```
http://localhost:3333/api
```

## Аутентификация

Для vNext API используйте project JWT:

- `Authorization: Bearer <JWT>`
- `x-project-id: <PROJECT_ID>` (рекомендуется для явного project context)

Пример:

```bash
curl -X GET http://localhost:3333/api/threads \
  -H "Authorization: Bearer $AMB_TOKEN" \
  -H "x-project-id: $AMB_PROJECT_ID"
```

## Формат ответа

Все endpoints возвращают JSON со следующей структурой:

```json
{
  "data": { ... }
}
```

Ответы с ошибками:

```json
{
  "error": {
    "code": "error_code",
    "message": "Человекочитаемое сообщение об ошибке",
    "details": { ... }
  }
}
```

## Агенты

### Список агентов

Получить всех зарегистрированных агентов.

**Endpoint:** `GET /api/agents`

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Developer",
      "role": "dev",
      "status": "online",
      "capabilities": ["code", "review"],
      "createdAt": "2026-01-27T10:00:00Z",
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ]
}
```

**Пример:**

```bash
curl http://localhost:3333/api/agents
```

### Регистрация агента

Зарегистрировать нового агента.

**Endpoint:** `POST /api/agents`

**Request Body:**

```json
{
  "name": "My Agent",
  "role": "worker",
  "capabilities": ["task1", "task2"]
}
```

**Response:** `201 Created`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Agent",
    "role": "worker",
    "status": "online",
    "capabilities": ["task1", "task2"],
    "createdAt": "2026-01-27T10:00:00Z",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
}
```

**Пример:**

```bash
curl -X POST http://localhost:3333/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Agent",
    "role": "worker",
    "capabilities": ["task1", "task2"]
  }'
```

### Поиск агентов

Поиск агентов по имени или роли.

**Endpoint:** `GET /api/agents/search?q=<query>`

**Query Parameters:**

- `q` (string, optional): Поисковый запрос

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Developer",
      "role": "dev",
      "status": "online",
      "capabilities": ["code", "review"],
      "createdAt": "2026-01-27T10:00:00Z",
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ]
}
```

**Пример:**

```bash
curl "http://localhost:3333/api/agents/search?q=dev"
```

## Треды

### Список тредов

Получить все треды.

**Endpoint:** `GET /api/threads`

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Feature Development",
      "status": "open",
      "createdAt": "2026-01-27T10:00:00Z",
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ]
}
```

**Пример:**

```bash
curl http://localhost:3333/api/threads
```

### Создать тред

Создать новый тред.

**Endpoint:** `POST /api/threads`

**Request Body:**

```json
{
  "title": "Feature Development",
  "status": "open"
}
```

- `title` (string, required): Название треда
- `status` (string, optional): Статус треда (`open` или `closed`). По умолчанию: `open`

**Response:** `201 Created`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Feature Development",
    "status": "open",
    "createdAt": "2026-01-27T10:00:00Z",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
}
```

**Пример:**

```bash
curl -X POST http://localhost:3333/api/threads \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Feature Development",
    "status": "open"
  }'
```

### Получить тред

Получить тред по ID.

**Endpoint:** `GET /api/threads/:id`

**Response:** `200 OK`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Feature Development",
    "status": "open",
    "createdAt": "2026-01-27T10:00:00Z",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
}
```

**Пример:**

```bash
curl http://localhost:3333/api/threads/550e8400-e29b-41d4-a716-446655440000
```

### Обновить статус треда

Обновить статус треда.

**Endpoint:** `PATCH /api/threads/:id`

**Request Body:**

```json
{
  "status": "closed"
}
```

- `status` (string, required): Новый статус (`open`, `closed`, или `archived`)

**Response:** `200 OK`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Feature Development",
    "status": "closed",
    "createdAt": "2026-01-27T10:00:00Z",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
}
```

**Пример:**

```bash
curl -X PATCH http://localhost:3333/api/threads/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status": "closed"}'
```

### Удалить тред

Удалить тред.

**Endpoint:** `DELETE /api/threads/:id`

**Response:** `200 OK`

```json
{
  "data": {
    "success": true
  }
}
```

**Пример:**

```bash
curl -X DELETE http://localhost:3333/api/threads/550e8400-e29b-41d4-a716-446655440000
```

### Получить сообщения треда

Получить все сообщения в треде.

**Endpoint:** `GET /api/threads/:id/messages`

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "threadId": "550e8400-e29b-41d4-a716-446655440001",
      "fromAgentId": "550e8400-e29b-41d4-a716-446655440002",
      "toAgentId": "550e8400-e29b-41d4-a716-446655440003",
      "payload": {
        "text": "Hello, world!"
      },
      "status": "ack",
      "parentId": null,
      "createdAt": "2026-01-27T10:00:00Z",
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ]
}
```

**Пример:**

```bash
curl http://localhost:3333/api/threads/550e8400-e29b-41d4-a716-446655440000/messages
```

## Сообщения

### Отправить сообщение

Отправить сообщение между агентами.

**Endpoint:** `POST /api/messages/send`

**Request Body:**

```json
{
  "threadId": "550e8400-e29b-41d4-a716-446655440000",
  "fromAgentId": "550e8400-e29b-41d4-a716-446655440001",
  "toAgentId": "550e8400-e29b-41d4-a716-446655440002",
  "payload": {
    "text": "Hello, world!",
    "task": "Review this PR"
  },
  "parentId": null
}
```

- `threadId` (string, required, UUID): ID треда
- `fromAgentId` (string, required, UUID): ID агента-отправителя
- `toAgentId` (string, optional, UUID): ID агента-получателя (null для broadcast)
- `payload` (object, required): Payload сообщения (любой JSON объект)
- `parentId` (string, optional, UUID): ID родительского сообщения для ответов

**Response:** `201 Created`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "threadId": "550e8400-e29b-41d4-a716-446655440000",
    "fromAgentId": "550e8400-e29b-41d4-a716-446655440001",
    "toAgentId": "550e8400-e29b-41d4-a716-446655440002",
    "payload": {
      "text": "Hello, world!",
      "task": "Review this PR"
    },
    "status": "pending",
    "parentId": null,
    "createdAt": "2026-01-27T10:00:00Z",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
}
```

**Пример:**

```bash
curl -X POST http://localhost:3333/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "550e8400-e29b-41d4-a716-446655440000",
    "fromAgentId": "550e8400-e29b-41d4-a716-446655440001",
    "toAgentId": "550e8400-e29b-41d4-a716-446655440002",
    "payload": {
      "text": "Hello, world!"
    }
  }'
```

### Получить входящие

Получить ожидающие сообщения для агента.

**Endpoint:** `GET /api/messages/inbox?agentId=<uuid>`

**Query Parameters:**

- `agentId` (string, required, UUID): ID агента

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "threadId": "550e8400-e29b-41d4-a716-446655440001",
      "fromAgentId": "550e8400-e29b-41d4-a716-446655440002",
      "toAgentId": "550e8400-e29b-41d4-a716-446655440003",
      "payload": {
        "text": "Hello, world!"
      },
      "status": "pending",
      "parentId": null,
      "createdAt": "2026-01-27T10:00:00Z",
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ]
}
```

**Пример:**

```bash
curl "http://localhost:3333/api/messages/inbox?agentId=550e8400-e29b-41d4-a716-446655440000"
```

### Подтвердить сообщение

Подтвердить получение сообщения.

**Endpoint:** `POST /api/messages/:id/ack`

**Response:** `200 OK`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "threadId": "550e8400-e29b-41d4-a716-446655440001",
    "fromAgentId": "550e8400-e29b-41d4-a716-446655440002",
    "toAgentId": "550e8400-e29b-41d4-a716-446655440003",
    "payload": {
      "text": "Hello, world!"
    },
    "status": "ack",
    "parentId": null,
    "createdAt": "2026-01-27T10:00:00Z",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
}
```

**Пример:**

```bash
curl -X POST http://localhost:3333/api/messages/550e8400-e29b-41d4-a716-446655440000/ack
```

## Dead Letter Queue (DLQ)

### Получить DLQ

Получить все сообщения в очереди мёртвых писем (неудачные доставки).

**Endpoint:** `GET /api/dlq`

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "threadId": "550e8400-e29b-41d4-a716-446655440001",
      "fromAgentId": "550e8400-e29b-41d4-a716-446655440002",
      "toAgentId": "550e8400-e29b-41d4-a716-446655440003",
      "payload": {
        "text": "Hello, world!"
      },
      "status": "dlq",
      "retryCount": 3,
      "parentId": null,
      "createdAt": "2026-01-27T10:00:00Z",
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ]
}
```

**Пример:**

```bash
curl http://localhost:3333/api/dlq
```

### Повторить сообщение

Повторить неудачное сообщение из DLQ.

**Endpoint:** `POST /api/dlq/:id/retry`

**Response:** `200 OK`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "threadId": "550e8400-e29b-41d4-a716-446655440001",
    "fromAgentId": "550e8400-e29b-41d4-a716-446655440002",
    "toAgentId": "550e8400-e29b-41d4-a716-446655440003",
    "payload": {
      "text": "Hello, world!"
    },
    "status": "pending",
    "retryCount": 4,
    "parentId": null,
    "createdAt": "2026-01-27T10:00:00Z",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
}
```

**Пример:**

```bash
curl -X POST http://localhost:3333/api/dlq/550e8400-e29b-41d4-a716-446655440000/retry
```

### Повторить все

Повторить все сообщения в DLQ.

**Endpoint:** `POST /api/dlq/retry-all`

**Response:** `200 OK`

```json
{
  "data": {
    "success": true,
    "count": 5
  }
}
```

**Пример:**

```bash
curl -X POST http://localhost:3333/api/dlq/retry-all
```

## Коды ошибок

| Код | Описание |
|------|-------------|
| `invalid_json` | Тело запроса не является валидным JSON |
| `invalid_request` | Валидация тела запроса не прошла |
| `invalid_params` | Валидация параметров URL не прошла |
| `not_found` | Ресурс не найден |
| `internal_error` | Внутренняя ошибка сервера |

## HTTP статус коды

| Код | Описание |
|------|-------------|
| `200` | Успех |
| `201` | Создано |
| `400` | Неверный запрос |
| `404` | Не найдено |
| `500` | Внутренняя ошибка сервера |
