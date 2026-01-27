/**
 * Agent Message Bus SDK
 *
 * @example
 * ```ts
 * import { createClient } from "@/lib/sdk";
 *
 * const client = createClient("http://localhost:3333");
 *
 * // Register agent
 * const agent = await client.registerAgent({
 *   name: "my-agent",
 *   role: "worker",
 * });
 *
 * // Create thread
 * const thread = await client.createThread({ title: "Task #1" });
 *
 * // Send message
 * await client.sendMessage({
 *   threadId: thread.id,
 *   fromAgentId: agent.id,
 *   payload: { text: "Hello!" },
 * });
 *
 * // Poll inbox
 * for await (const messages of client.pollInbox(agent.id)) {
 *   for (const msg of messages) {
 *     console.log(msg.payload);
 *     await client.ackMessage(msg.id);
 *   }
 * }
 * ```
 */

export { MessageBusClient, MessageBusError, createClient } from "./client";
export * from "./types";
