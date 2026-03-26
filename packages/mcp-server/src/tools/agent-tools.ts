import type { ArgResolvers } from "../args/arg-resolvers";
import type { MessageBusClient } from "../client/message-bus-client";
import type { ToolArgs, ToolHandler } from "../types/tool-args";

export function createAgentToolHandlers(
  client: MessageBusClient,
  resolvers: ArgResolvers
): Record<string, ToolHandler> {
  return {
    list_project_members: async (args) => {
      const projectId = resolvers.resolveProjectId(args);
      return client.requestJson(
        `/api/agents?projectId=${encodeURIComponent(projectId)}`
      );
    },

    list_agents: () => client.requestJson("/api/agents"),

    register_agent: (args: ToolArgs) =>
      client.requestJson("/api/agents", {
        method: "POST",
        body: JSON.stringify({
          name: args.name,
          role: args.role,
          capabilities: args.capabilities,
        }),
      }),
  };
}
