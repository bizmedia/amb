#!/usr/bin/env node
/**
 * MCP Server for Agent Message Bus
 *
 * Exposes message bus operations as MCP tools for AI agents.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
const BASE_URL = process.env.MESSAGE_BUS_URL || "http://localhost:3333";
// ─────────────────────────────────────────────────────────────
// API Client
// ─────────────────────────────────────────────────────────────
async function apiCall(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
    }
    const json = await response.json();
    return json.data;
}
// ─────────────────────────────────────────────────────────────
// Tool Definitions
// ─────────────────────────────────────────────────────────────
const tools = [
    {
        name: "list_agents",
        description: "List all registered agents in the message bus",
        inputSchema: {
            type: "object",
            properties: {},
            required: [],
        },
    },
    {
        name: "register_agent",
        description: "Register a new agent in the message bus",
        inputSchema: {
            type: "object",
            properties: {
                name: { type: "string", description: "Agent name" },
                role: { type: "string", description: "Agent role (e.g., dev, qa, po)" },
                capabilities: {
                    type: "object",
                    description: "Optional capabilities object",
                },
            },
            required: ["name", "role"],
        },
    },
    {
        name: "list_threads",
        description: "List all threads in the message bus",
        inputSchema: {
            type: "object",
            properties: {},
            required: [],
        },
    },
    {
        name: "create_thread",
        description: "Create a new thread for agent communication",
        inputSchema: {
            type: "object",
            properties: {
                title: { type: "string", description: "Thread title" },
                status: {
                    type: "string",
                    enum: ["open", "closed"],
                    description: "Thread status (default: open)",
                },
            },
            required: ["title"],
        },
    },
    {
        name: "get_thread_messages",
        description: "Get all messages in a thread",
        inputSchema: {
            type: "object",
            properties: {
                threadId: { type: "string", description: "Thread UUID" },
            },
            required: ["threadId"],
        },
    },
    {
        name: "get_thread",
        description: "Get a thread by ID",
        inputSchema: {
            type: "object",
            properties: {
                threadId: { type: "string", description: "Thread UUID" },
            },
            required: ["threadId"],
        },
    },
    {
        name: "update_thread",
        description: "Update a thread status",
        inputSchema: {
            type: "object",
            properties: {
                threadId: { type: "string", description: "Thread UUID" },
                status: {
                    type: "string",
                    enum: ["open", "closed", "archived"],
                    description: "New thread status",
                },
            },
            required: ["threadId", "status"],
        },
    },
    {
        name: "close_thread",
        description: "Close a thread (shortcut for update_thread with status=closed)",
        inputSchema: {
            type: "object",
            properties: {
                threadId: { type: "string", description: "Thread UUID" },
            },
            required: ["threadId"],
        },
    },
    {
        name: "send_message",
        description: "Send a message to a thread",
        inputSchema: {
            type: "object",
            properties: {
                threadId: { type: "string", description: "Thread UUID" },
                fromAgentId: { type: "string", description: "Sender agent UUID" },
                toAgentId: {
                    type: "string",
                    description: "Recipient agent UUID (optional for broadcast)",
                },
                payload: {
                    type: "object",
                    description: "Message payload (any JSON object)",
                },
                parentId: {
                    type: "string",
                    description: "Parent message UUID for replies",
                },
            },
            required: ["threadId", "fromAgentId", "payload"],
        },
    },
    {
        name: "get_inbox",
        description: "Get pending messages for an agent",
        inputSchema: {
            type: "object",
            properties: {
                agentId: { type: "string", description: "Agent UUID" },
            },
            required: ["agentId"],
        },
    },
    {
        name: "ack_message",
        description: "Acknowledge a message as received/processed",
        inputSchema: {
            type: "object",
            properties: {
                messageId: { type: "string", description: "Message UUID" },
            },
            required: ["messageId"],
        },
    },
    {
        name: "get_dlq",
        description: "Get messages in the dead letter queue",
        inputSchema: {
            type: "object",
            properties: {},
            required: [],
        },
    },
];
async function handleTool(name, args) {
    switch (name) {
        case "list_agents":
            return apiCall("/api/agents");
        case "register_agent":
            return apiCall("/api/agents", {
                method: "POST",
                body: JSON.stringify({
                    name: args.name,
                    role: args.role,
                    capabilities: args.capabilities,
                }),
            });
        case "list_threads":
            return apiCall("/api/threads");
        case "create_thread":
            return apiCall("/api/threads", {
                method: "POST",
                body: JSON.stringify({
                    title: args.title,
                    status: args.status,
                }),
            });
        case "get_thread_messages":
            return apiCall(`/api/threads/${args.threadId}/messages`);
        case "send_message":
            return apiCall("/api/messages/send", {
                method: "POST",
                body: JSON.stringify({
                    threadId: args.threadId,
                    fromAgentId: args.fromAgentId,
                    toAgentId: args.toAgentId,
                    payload: args.payload,
                    parentId: args.parentId,
                }),
            });
        case "get_inbox":
            return apiCall(`/api/messages/inbox?agentId=${args.agentId}`);
        case "ack_message":
            return apiCall(`/api/messages/${args.messageId}/ack`, {
                method: "POST",
            });
        case "get_dlq":
            return apiCall("/api/dlq");
        case "get_thread":
            return apiCall(`/api/threads/${args.threadId}`);
        case "update_thread":
            return apiCall(`/api/threads/${args.threadId}`, {
                method: "PATCH",
                body: JSON.stringify({ status: args.status }),
            });
        case "close_thread":
            return apiCall(`/api/threads/${args.threadId}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "closed" }),
            });
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
// ─────────────────────────────────────────────────────────────
// Server Setup
// ─────────────────────────────────────────────────────────────
const server = new Server({
    name: "message-bus",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const result = await handleTool(name, args || {});
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${message}`,
                },
            ],
            isError: true,
        };
    }
});
// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Message Bus MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
