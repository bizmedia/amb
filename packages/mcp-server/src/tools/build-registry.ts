import type { ArgResolvers } from "../args/arg-resolvers";
import type { MessageBusClient } from "../client/message-bus-client";
import type { ToolHandler } from "../types/tool-args";
import { createAgentToolHandlers } from "./agent-tools";
import { createIssueToolHandlers } from "./issue-tools";
import { createMessagingToolHandlers } from "./messaging-tools";
import { createThreadToolHandlers } from "./thread-tools";

export type ToolRegistryDeps = {
  client: MessageBusClient;
  resolvers: ArgResolvers;
};

/**
 * Собирает реестр инструментов из доменных модулей.
 * Новый домен — новый `create*ToolHandlers` и одна строка в merge (OCP).
 */
export function buildToolRegistry(deps: ToolRegistryDeps): Record<string, ToolHandler> {
  return {
    ...createIssueToolHandlers(deps.client, deps.resolvers),
    ...createAgentToolHandlers(deps.client, deps.resolvers),
    ...createThreadToolHandlers(deps.client),
    ...createMessagingToolHandlers(deps.client),
  };
}
