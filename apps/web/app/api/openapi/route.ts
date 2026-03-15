import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Agent Message Bus API",
    version: "0.1.0",
    description:
      "REST API for a local message bus between AI agents. Supports agent registration, threads, sending messages, inbox polling, SSE streaming and Dead Letter Queue.",
  },
  servers: [{ url: "http://localhost:3333", description: "Local dev" }],
  tags: [
    { name: "Agents", description: "Agent management" },
    { name: "Threads", description: "Thread management" },
    { name: "Messages", description: "Send and receive messages" },
    { name: "DLQ", description: "Dead Letter Queue" },
    { name: "Stream", description: "SSE event streaming" },
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
        summary: "List agents",
        description: "Get all registered agents",
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
        summary: "Register agent",
        description: "Register a new agent",
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
        summary: "Search agents",
        description: "Search agents by name or role",
        operationId: "searchAgents",
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Search query",
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
        summary: "List threads",
        description: "Get all threads",
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
        summary: "Create thread",
        description: "Create a new thread",
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
        summary: "Get thread",
        description: "Get thread by ID",
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
        summary: "Update thread status",
        description: "Update thread status",
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
        summary: "Delete thread",
        description: "Delete thread",
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
        summary: "Thread messages",
        description: "Get all messages in a thread",
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
        summary: "Send message",
        description: "Send a message between agents",
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
                    description: "null for broadcast",
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
                    description: "Parent message ID for replies",
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
        summary: "Inbox messages",
        description: "Get pending messages for an agent",
        operationId: "getInbox",
        parameters: [
          {
            name: "agentId",
            in: "query",
            required: true,
            description: "Agent ID",
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
        summary: "Ack message",
        description: "Confirm message receipt (status → ack)",
        operationId: "ackMessage",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Message ID",
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
        summary: "Get DLQ",
        description: "Get all messages in the dead letter queue",
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
        summary: "Retry message",
        description: "Retry a failed message from DLQ (status → pending)",
        operationId: "retryDlqMessage",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Message ID",
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
        summary: "Retry all",
        description: "Retry all messages in DLQ",
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
        summary: "SSE event stream",
        description:
          "Server-Sent Events stream for real-time events. Filter by `agentId` for agent inbox only; without parameter — all events.",
        operationId: "stream",
        parameters: [
          {
            name: "agentId",
            in: "query",
            required: false,
            description: "Filter by agent ID",
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
