# API Reference

Complete API documentation for Agent Message Bus.

## Base URL

All API endpoints are prefixed with `/api`:

```
http://localhost:3333/api
```

## Response Format

All endpoints return JSON with the following structure:

```json
{
  "data": { ... }
}
```

Error responses:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

## Agents

### List Agents

Get all registered agents.

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

**Example:**

```bash
curl http://localhost:3333/api/agents
```

### Register Agent

Register a new agent.

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

**Example:**

```bash
curl -X POST http://localhost:3333/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Agent",
    "role": "worker",
    "capabilities": ["task1", "task2"]
  }'
```

### Search Agents

Search agents by name or role.

**Endpoint:** `GET /api/agents/search?q=<query>`

**Query Parameters:**

- `q` (string, optional): Search query

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

**Example:**

```bash
curl "http://localhost:3333/api/agents/search?q=dev"
```

## Threads

### List Threads

Get all threads.

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

**Example:**

```bash
curl http://localhost:3333/api/threads
```

### Create Thread

Create a new thread.

**Endpoint:** `POST /api/threads`

**Request Body:**

```json
{
  "title": "Feature Development",
  "status": "open"
}
```

- `title` (string, required): Thread title
- `status` (string, optional): Thread status (`open` or `closed`). Default: `open`

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

**Example:**

```bash
curl -X POST http://localhost:3333/api/threads \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Feature Development",
    "status": "open"
  }'
```

### Get Thread

Get a thread by ID.

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

**Example:**

```bash
curl http://localhost:3333/api/threads/550e8400-e29b-41d4-a716-446655440000
```

### Update Thread Status

Update thread status.

**Endpoint:** `PATCH /api/threads/:id`

**Request Body:**

```json
{
  "status": "closed"
}
```

- `status` (string, required): New status (`open`, `closed`, or `archived`)

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

**Example:**

```bash
curl -X PATCH http://localhost:3333/api/threads/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status": "closed"}'
```

### Delete Thread

Delete a thread.

**Endpoint:** `DELETE /api/threads/:id`

**Response:** `200 OK`

```json
{
  "data": {
    "success": true
  }
}
```

**Example:**

```bash
curl -X DELETE http://localhost:3333/api/threads/550e8400-e29b-41d4-a716-446655440000
```

### Get Thread Messages

Get all messages in a thread.

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

**Example:**

```bash
curl http://localhost:3333/api/threads/550e8400-e29b-41d4-a716-446655440000/messages
```

## Messages

### Send Message

Send a message between agents.

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

- `threadId` (string, required, UUID): Thread ID
- `fromAgentId` (string, required, UUID): Sender agent ID
- `toAgentId` (string, optional, UUID): Recipient agent ID (null for broadcast)
- `payload` (object, required): Message payload (any JSON object)
- `parentId` (string, optional, UUID): Parent message ID for replies

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

**Example:**

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

### Get Inbox

Get pending messages for an agent.

**Endpoint:** `GET /api/messages/inbox?agentId=<uuid>`

**Query Parameters:**

- `agentId` (string, required, UUID): Agent ID

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

**Example:**

```bash
curl "http://localhost:3333/api/messages/inbox?agentId=550e8400-e29b-41d4-a716-446655440000"
```

### Acknowledge Message

Acknowledge receipt of a message.

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

**Example:**

```bash
curl -X POST http://localhost:3333/api/messages/550e8400-e29b-41d4-a716-446655440000/ack
```

## Dead Letter Queue (DLQ)

### Get DLQ

Get all messages in the dead letter queue (failed deliveries).

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

**Example:**

```bash
curl http://localhost:3333/api/dlq
```

### Retry Message

Retry a failed message from DLQ.

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

**Example:**

```bash
curl -X POST http://localhost:3333/api/dlq/550e8400-e29b-41d4-a716-446655440000/retry
```

### Retry All

Retry all messages in DLQ.

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

**Example:**

```bash
curl -X POST http://localhost:3333/api/dlq/retry-all
```

## Error Codes

| Code | Description |
|------|-------------|
| `invalid_json` | Request body is not valid JSON |
| `invalid_request` | Request body validation failed |
| `invalid_params` | URL parameters validation failed |
| `not_found` | Resource not found |
| `internal_error` | Internal server error |

## Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `404` | Not Found |
| `500` | Internal Server Error |
