#!/usr/bin/env tsx
/**
 * Inbox Listener Example
 *
 * Демонстрирует polling inbox с автоматическим ack:
 * - Подключение к существующему агенту
 * - Непрерывный polling входящих
 * - Обработка и ACK сообщений
 */

import { createClient } from "../lib/sdk/index.js";

const client = createClient("http://localhost:3333");

async function main() {
  const agentId = process.argv[2];

  if (!agentId) {
    console.error("Usage: tsx inbox-listener.ts <agentId>");
    console.error("\nGet agent ID from: http://localhost:3333/api/agents");
    process.exit(1);
  }

  console.log(`📬 Listening for messages to agent: ${agentId}`);
  console.log("Press Ctrl+C to stop\n");

  const controller = new AbortController();

  process.on("SIGINT", () => {
    console.log("\n\n👋 Shutting down...");
    controller.abort();
  });

  try {
    for await (const messages of client.pollInbox(agentId, {
      interval: 2000,
      signal: controller.signal,
    })) {
      for (const msg of messages) {
        console.log(`\n📨 New message: ${msg.id}`);
        console.log(`   From: ${msg.fromAgentId}`);
        console.log(`   Thread: ${msg.threadId}`);
        console.log(`   Payload:`, msg.payload);

        // ACK the message
        await client.ackMessage(msg.id);
        console.log(`   ✅ ACK sent`);
      }
    }
  } catch (error) {
    if ((error as Error).message !== "Aborted") {
      throw error;
    }
  }

  console.log("Done!");
}

main().catch(console.error);
