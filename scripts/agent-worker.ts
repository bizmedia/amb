#!/usr/bin/env tsx
/**
 * Agent Worker Service
 *
 * Автоматически проверяет inbox для всех зарегистрированных агентов
 * и обрабатывает входящие сообщения.
 */

import { createClient, type Message } from "../lib/sdk/index.js";

const client = createClient(process.env.MESSAGE_BUS_URL ?? "http://localhost:3333");

interface AgentWorker {
  agentId: string;
  agentName: string;
  controller: AbortController;
  polling: Promise<void>;
}

const workers = new Map<string, AgentWorker>();

/**
 * Обработка сообщения агентом
 */
async function handleMessage(agentId: string, message: Message): Promise<void> {
  const payload = message.payload as { type?: string; [key: string]: unknown };

  console.log(`\n📨 [${new Date().toISOString()}] Message to agent ${agentId}:`);
  console.log(`   ID: ${message.id}`);
  console.log(`   From: ${message.fromAgentId}`);
  console.log(`   Thread: ${message.threadId}`);
  console.log(`   Type: ${payload.type ?? "unknown"}`);

  // Автоматический ответ на task-сообщения
  if (payload.type === "task") {
    const task = payload.task as string;
    const step = payload.step as number;

    console.log(`   ⚙️  Processing task: ${task}`);

    // Отправляем ответ
    const response = await client.sendMessage({
      threadId: message.threadId,
      fromAgentId: agentId,
      toAgentId: message.fromAgentId,
      parentId: message.id,
      payload: {
        type: "response",
        status: "completed",
        step,
        task,
        result: {
          message: `Task "${task}" completed successfully`,
          completedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`   ✅ Response sent: ${response.id}`);
  }

  // Всегда отправляем ACK
  await client.ackMessage(message.id);
  console.log(`   ✅ ACK sent`);
}

/**
 * Запуск polling для одного агента
 */
async function startAgentWorker(agentId: string, agentName: string): Promise<void> {
  if (workers.has(agentId)) {
    console.log(`⚠️  Worker for agent ${agentId} already running`);
    return;
  }

  const controller = new AbortController();
  const worker: AgentWorker = {
    agentId,
    agentName,
    controller,
    polling: (async () => {
      console.log(`🚀 Starting worker for: ${agentName} (${agentId})`);

      try {
        for await (const messages of client.pollInbox(agentId, {
          interval: 2000, // Проверка каждые 2 секунды
          signal: controller.signal,
        })) {
          for (const msg of messages) {
            try {
              await handleMessage(agentId, msg);
            } catch (error) {
              console.error(`❌ Error processing message ${msg.id}:`, error);
              // Не отправляем ACK при ошибке
            }
          }
        }
      } catch (error) {
        if ((error as Error).message !== "Aborted") {
          console.error(`❌ Worker error:`, error);
        }
      } finally {
        console.log(`🛑 Worker stopped for: ${agentName}`);
        workers.delete(agentId);
      }
    })(),
  };

  workers.set(agentId, worker);
}

/**
 * Главная функция
 */
async function main() {
  const agentId = process.argv.find((arg) => arg.startsWith("--agent-id="))?.split("=")[1];

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🤖 AGENT WORKER SERVICE                                  ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n\n🛑 Shutting down...");
    for (const worker of workers.values()) {
      worker.controller.abort();
    }
    await Promise.all(Array.from(workers.values()).map((w) => w.polling.catch(() => {})));
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  if (agentId) {
    // Для конкретного агента
    const agents = await client.listAgents();
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) {
      console.error(`❌ Agent ${agentId} not found`);
      process.exit(1);
    }
    await startAgentWorker(agent.id, agent.name);
    await workers.get(agentId)?.polling;
  } else {
    // Для всех агентов
    console.log("🔍 Discovering agents...");
    const agents = await client.listAgents();

    if (agents.length === 0) {
      console.log("⚠️  No agents found. Register agents first.");
      return;
    }

    console.log(`✅ Found ${agents.length} agents\n`);

    for (const agent of agents) {
      // Пропускаем orchestrator
      if (agent.role === "orchestrator") continue;
      await startAgentWorker(agent.id, agent.name);
    }

    console.log(`\n✅ Started ${workers.size} workers\n`);

    // Периодически проверяем новых агентов
    setInterval(async () => {
      const agents = await client.listAgents();
      for (const agent of agents) {
        if (agent.role === "orchestrator") continue;
        if (!workers.has(agent.id)) {
          console.log(`🆕 New agent: ${agent.name}, starting worker...`);
          await startAgentWorker(agent.id, agent.name);
        }
      }
    }, 10000); // Каждые 10 секунд

    // Ждём бесконечно
    await new Promise(() => {});
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err);
  process.exit(1);
});