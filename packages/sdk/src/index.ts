/**
 * Agent Message Bus SDK
 *
 * @example
 * ```ts
 * import { createClient } from "@amb-app/sdk";
 *
 * const client = createClient({ baseUrl: "http://localhost:3333" });
 * const agent = await client.registerAgent({ name: "my-agent", role: "worker" });
 * const thread = await client.createThread({ title: "Task #1" });
 * await client.sendMessage({
 *   threadId: thread.id,
 *   fromAgentId: agent.id,
 *   payload: { text: "Hello!" },
 * });
 * ```
 */

export { MessageBusClient, MessageBusError, createClient } from "./client";
export type { CreateClientOptions } from "./client";
export * from "./types";
