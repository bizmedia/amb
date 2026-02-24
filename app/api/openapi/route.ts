import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Agent Message Bus API",
    version: "0.1.0",
    description:
      "REST API для локальной шины сообщений между AI-агентами. Поддерживает регистрацию агентов, треды, отправку сообщений, inbox polling, SSE-стриминг и Dead Letter Queue.",
  },
  servers: [{ url: "http://localhost:3333", description: "Local dev" }],
  tags: [
    { name: "Agents", description: "Управление агентами" },
    { name: "Threads", description: "Управление тредами" },
    { name: "Messages", description: "Отправка и получение сообщений" },
    { name: "DLQ", description: "Dead Letter Queue" },
    { name: "Stream", description: "SSE-стриминг событий" },
  ],
  components: {
    schemas: {
      Agent: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Developer" },
          role: { type: "string", example: "dev" },
          status: {
            type: "string",
            enum: ["online", "offline"],
            example: "online",
          },
          capabilities: {
            type: "array",
            items: { type: "string" },
            example: ["code", "review"],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "role", "status", "capabilities", "createdAt", "updatedAt"],
      },
      Thread: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Feature Development" },
          status: {
            type: "string",
            enum: ["open", "closed", "archived"],
            example: "open",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "title", "status", "createdAt", "updatedAt"],
      },
      Message: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          threadId: { type: "string", format: "uuid" },
          fromAgentId: { type: "string", format: "uuid" },
          toAgentId: { type: "string", format: "uuid", nullable: true },
          payload: {
            type: "object",
            additionalProperties: true,
            example: { text: "Hello, world!" },
          },
          status: {
            type: "string",
            enum: ["pending", "ack", "dlq"],
            example: "pending",
          },
          retryCount: { type: "integer", example: 0 },
          parentId: { type: "string", format: "uuid", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "threadId", "fromAgentId", "payload", "status", "createdAt", "updatedAt"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "not_found" },
              message: { type: "string", example: "Resource not found" },
              details: { type: "object", additionalProperties: true },
            },
            required: ["code", "message"],
          },
        },
      },
    },
    responses: {
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      BadRequest: {
        description: "Invalid request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      InternalError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
  paths: {
    "/api/agents": {
      get: {
        tags: ["Agents"],
        summary: "Список агентов",
        description: "Получить всех зарегистрированных агентов",
        operationId: "listAgents",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Agent" },
                    },
                  },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      post: {
        tags: ["Agents"],
        summary: "Регистрация агента",
        description: "Зарегистрировать нового агента",
        operationId: "createAgent",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "My Agent" },
                  role: { type: "string", example: "worker" },
                  capabilities: {
                    type: "array",
                    items: { type: "string" },
                    example: ["task1", "task2"],
                  },
                },
                required: ["name", "role"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Agent" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/agents/search": {
      get: {
        tags: ["Agents"],
        summary: "Поиск агентов",
        description: "Поиск агентов по имени или роли",
        operationId: "searchAgents",
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Поисковый запрос",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Agent" },
                    },
                  },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/threads": {
      get: {
        tags: ["Threads"],
        summary: "Список тредов",
        description: "Получить все треды",
        operationId: "listThreads",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Thread" },
                    },
                  },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      post: {
        tags: ["Threads"],
        summary: "Создать тред",
        description: "Создать новый тред",
        operationId: "createThread",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Feature Development" },
                  status: {
                    type: "string",
                    enum: ["open", "closed"],
                    default: "open",
                  },
                },
                required: ["title"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Thread" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/threads/{id}": {
      get: {
        tags: ["Threads"],
        summary: "Получить тред",
        description: "Получить тред по ID",
        operationId: "getThread",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Thread" } },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      patch: {
        tags: ["Threads"],
        summary: "Обновить статус треда",
        description: "Обновить статус треда",
        operationId: "updateThread",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["open", "closed", "archived"],
                    example: "closed",
                  },
                },
                required: ["status"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Thread" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      delete: {
        tags: ["Threads"],
        summary: "Удалить тред",
        description: "Удалить тред",
        operationId: "deleteThread",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: { success: { type: "boolean" } },
                    },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/threads/{id}/messages": {
      get: {
        tags: ["Threads"],
        summary: "Сообщения треда",
        description: "Получить все сообщения в треде",
        operationId: "getThreadMessages",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Message" },
                    },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/messages/send": {
      post: {
        tags: ["Messages"],
        summary: "Отправить сообщение",
        description: "Отправить сообщение между агентами",
        operationId: "sendMessage",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  threadId: {
                    type: "string",
                    format: "uuid",
                    example: "550e8400-e29b-41d4-a716-446655440000",
                  },
                  fromAgentId: {
                    type: "string",
                    format: "uuid",
                    example: "550e8400-e29b-41d4-a716-446655440001",
                  },
                  toAgentId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    description: "null для broadcast",
                    example: "550e8400-e29b-41d4-a716-446655440002",
                  },
                  payload: {
                    type: "object",
                    additionalProperties: true,
                    example: { text: "Hello, world!", task: "Review this PR" },
                  },
                  parentId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    description: "ID родительского сообщения для ответов",
                  },
                },
                required: ["threadId", "fromAgentId", "payload"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Message" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/messages/inbox": {
      get: {
        tags: ["Messages"],
        summary: "Входящие сообщения",
        description: "Получить ожидающие сообщения для агента",
        operationId: "getInbox",
        parameters: [
          {
            name: "agentId",
            in: "query",
            required: true,
            description: "ID агента",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Message" },
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/messages/{id}/ack": {
      post: {
        tags: ["Messages"],
        summary: "Подтвердить сообщение",
        description: "Подтвердить получение сообщения (статус → ack)",
        operationId: "ackMessage",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID сообщения",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Message" } },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/dlq": {
      get: {
        tags: ["DLQ"],
        summary: "Получить DLQ",
        description: "Получить все сообщения в очереди мёртвых писем",
        operationId: "getDlq",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Message" },
                    },
                  },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/dlq/{id}/retry": {
      post: {
        tags: ["DLQ"],
        summary: "Повторить сообщение",
        description: "Повторить неудачное сообщение из DLQ (статус → pending)",
        operationId: "retryDlqMessage",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID сообщения",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Message" } },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/dlq/retry-all": {
      post: {
        tags: ["DLQ"],
        summary: "Повторить все",
        description: "Повторить все сообщения в DLQ",
        operationId: "retryAllDlq",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        count: { type: "integer", example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/stream": {
      get: {
        tags: ["Stream"],
        summary: "SSE-стрим событий",
        description:
          "Server-Sent Events стрим для получения событий в реальном времени. Фильтрация по `agentId` — только входящие для агента, без параметра — все события.",
        operationId: "stream",
        parameters: [
          {
            name: "agentId",
            in: "query",
            required: false,
            description: "Фильтр по ID агента",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "SSE stream (text/event-stream)",
            content: {
              "text/event-stream": {
                schema: {
                  type: "string",
                  example: 'data: {"type":"message","payload":{...}}\n\n',
                },
              },
            },
          },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec);
}
