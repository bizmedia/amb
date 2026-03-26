import type { MessageBusClient } from "../client/message-bus-client";
import type { ToolArgs, ToolHandler } from "../types/tool-args";

export function createThreadToolHandlers(client: MessageBusClient): Record<string, ToolHandler> {
  return {
    list_threads: () => client.requestJson("/api/threads"),

    create_thread: (args: ToolArgs) =>
      client.requestJson("/api/threads", {
        method: "POST",
        body: JSON.stringify({
          title: args.title,
          status: args.status,
        }),
      }),

    get_thread_messages: (args: ToolArgs) =>
      client.requestJson(`/api/threads/${args.threadId}/messages`),

    get_thread: (args: ToolArgs) => client.requestJson(`/api/threads/${args.threadId}`),

    update_thread: (args: ToolArgs) =>
      client.requestJson(`/api/threads/${args.threadId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: args.status }),
      }),

    close_thread: (args: ToolArgs) =>
      client.requestJson(`/api/threads/${args.threadId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "closed" }),
      }),
  };
}
