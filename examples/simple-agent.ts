#!/usr/bin/env tsx
/**
 * Simple Agent Example
 *
 * Демонстрирует базовое использование SDK:
 * - Регистрация агента
 * - Создание треда
 * - Отправка сообщения
 * - Polling inbox
 */

import { createClient } from "../lib/sdk/index.js";

const client = createClient("http://localhost:3333");

async function main() {
  console.log("🚀 Starting Simple Agent...\n");

  // 1. Регистрируем агента
  const agent = await client.registerAgent({
    name: "simple-agent",
    role: "worker",
    capabilities: { languages: ["typescript"] },
  });
  console.log("✅ Agent registered:", agent.id);

  // 2. Создаём тред
  const thread = await client.createThread({
    title: "Simple Agent Test",
  });
  console.log("✅ Thread created:", thread.id);

  // 3. Отправляем сообщение
  const message = await client.sendMessage({
    threadId: thread.id,
    fromAgentId: agent.id,
    payload: {
      type: "greeting",
      text: "Hello from Simple Agent!",
      timestamp: new Date().toISOString(),
    },
  });
  console.log("✅ Message sent:", message.id);

  // 4. Получаем сообщения треда
  const messages = await client.getThreadMessages(thread.id);
  console.log("\n📨 Thread messages:");
  for (const msg of messages) {
    console.log(`  - [${msg.status}] ${JSON.stringify(msg.payload)}`);
  }

  console.log("\n✨ Done!");
}

main().catch(console.error);
