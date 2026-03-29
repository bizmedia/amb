#!/usr/bin/env node
/**
 * MCP Server for Agent Message Bus
 *
 * Exposes message bus operations as MCP tools for AI agents.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { handleTool } from "./handlers";
import { loadProjectEnv } from "./load-project-env";
import { createMcpCallToolExecutor } from "./server/mcp-call-tool-executor";
import { tools } from "./schemas";

loadProjectEnv();

// ─────────────────────────────────────────────────────────────
// Server Setup
// ─────────────────────────────────────────────────────────────

const mcpServer = new McpServer(
  {
    name: "amb",
    version: "0.1.0",
    description: "Agent Message Bus MCP server for agent communication and orchestration",
    websiteUrl: "https://github.com/bizmedia/amb#readme",
  },
  {
    // SDK ≥1.25: без capabilities.tools нельзя вешать handlers на tools/list и tools/call.
    capabilities: {
      tools: {},
    },
  }
);

/** Low-level protocol server (exposed by McpServer) for custom list/call handlers. */
const server = mcpServer.server;

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

const runCallTool = createMcpCallToolExecutor(handleTool);
server.setRequestHandler(CallToolRequestSchema, runCallTool);

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────

export async function main(): Promise<void> {
  const transport = new StdioServerTransport();
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
