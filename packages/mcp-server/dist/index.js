#!/usr/bin/env node
"use strict";
/**
 * MCP Server for Agent Message Bus
 *
 * Exposes message bus operations as MCP tools for AI agents.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const handlers_1 = require("./handlers");
const load_project_env_1 = require("./load-project-env");
const mcp_call_tool_executor_1 = require("./server/mcp-call-tool-executor");
const schemas_1 = require("./schemas");
(0, load_project_env_1.loadProjectEnv)();
// ─────────────────────────────────────────────────────────────
// Server Setup
// ─────────────────────────────────────────────────────────────
const mcpServer = new mcp_js_1.McpServer({
    name: "amb",
    version: "0.1.0",
    description: "Agent Message Bus MCP server for agent communication and orchestration",
    websiteUrl: "https://github.com/bizmedia/amb#readme",
}, {
    // SDK ≥1.25: без capabilities.tools нельзя вешать handlers на tools/list и tools/call.
    capabilities: {
        tools: {},
    },
});
/** Low-level protocol server (exposed by McpServer) for custom list/call handlers. */
const server = mcpServer.server;
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: schemas_1.tools,
}));
const runCallTool = (0, mcp_call_tool_executor_1.createMcpCallToolExecutor)(handlers_1.handleTool);
server.setRequestHandler(types_js_1.CallToolRequestSchema, runCallTool);
// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await mcpServer.connect(transport);
    console.error("Message Bus MCP Server running on stdio");
}
const entry = process.argv[1]?.replace(/\\/g, "/") ?? "";
if (/(?:^|\/)index\.(js|ts)$/.test(entry)) {
    main().catch((error) => {
        console.error("Server error:", error);
        process.exit(1);
    });
}
