import { createArgResolvers } from "./args/arg-resolvers";
import { createFetchMessageBusClient } from "./client/fetch-message-bus-client";
import { getMessageBusConfig } from "./config/message-bus-config";
import { buildToolRegistry, type ToolRegistryDeps } from "./tools/build-registry";
import type { ToolArgs } from "./types/tool-args";

const config = getMessageBusConfig();
const client = createFetchMessageBusClient(config);
const resolvers = createArgResolvers(config.defaultProjectId);

export const toolHandlers = buildToolRegistry({ client, resolvers });

export function handleTool(name: string, args: ToolArgs): Promise<unknown> {
  const handler = toolHandlers[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return handler(args);
}

/** Явная сборка контекста (тесты, альтернативный клиент) — DIP. */
export function createToolExecutionContext(deps: ToolRegistryDeps) {
  const registry = buildToolRegistry(deps);
  return {
    toolHandlers: registry,
    handleTool(name: string, args: ToolArgs): Promise<unknown> {
      const handler = registry[name];
      if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
      }
      return handler(args);
    },
  };
}
