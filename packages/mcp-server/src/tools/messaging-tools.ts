import type { MessageBusClient } from "../client/message-bus-client";
import type { ToolArgs, ToolHandler } from "../types/tool-args";

export function createMessagingToolHandlers(
  client: MessageBusClient
): Record<string, ToolHandler> {
  return {
    send_message: (args: ToolArgs) =>
      client.requestJson("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({
          threadId: args.threadId,
          fromAgentId: args.fromAgentId,
          toAgentId: args.toAgentId,
          payload: args.payload,
          parentId: args.parentId,
        }),
      }),

    get_inbox: (args: ToolArgs) =>
      client.requestJson(`/api/messages/inbox?agentId=${args.agentId}`),

    ack_message: (args: ToolArgs) =>
      client.requestJson(`/api/messages/${args.messageId}/ack`, {
        method: "POST",
      }),

    get_dlq: () => client.requestJson("/api/dlq"),
  };
}
