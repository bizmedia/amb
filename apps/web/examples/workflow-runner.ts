#!/usr/bin/env tsx
/**
 * Workflow Runner Example
 *
 * Демонстрирует orchestration workflow:
 * - Создание workflow треда
 * - Последовательная отправка задач агентам
 * - Ожидание ответов
 */

import { createClient } from "../lib/sdk/index.js";

const client = createClient("http://localhost:3333");

interface WorkflowStep {
  agent: string;
  task: string;
}

async function runWorkflow(title: string, steps: WorkflowStep[]) {
  console.log(`\n🔄 Starting workflow: ${title}\n`);

  // Получаем список агентов
  const agents = await client.listAgents();
  const agentMap = new Map(agents.map((a) => [a.role, a]));

  // Создаём тред для workflow
  const thread = await client.createThread({ title });
  console.log(`📋 Thread: ${thread.id}\n`);

  // Нужен orchestrator агент
  let orchestrator = agentMap.get("orchestrator");
  if (!orchestrator) {
    orchestrator = await client.registerAgent({
      name: "workflow-orchestrator",
      role: "orchestrator",
    });
    console.log(`✅ Created orchestrator: ${orchestrator.id}\n`);
  }

  // Выполняем шаги
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const targetAgent = agentMap.get(step.agent);

    console.log(`Step ${i + 1}/${steps.length}: ${step.task}`);

    if (!targetAgent) {
      console.log(`  ⚠️  Agent with role "${step.agent}" not found, skipping`);
      continue;
    }

    // Отправляем задачу
    const message = await client.sendMessage({
      threadId: thread.id,
      fromAgentId: orchestrator.id,
      toAgentId: targetAgent.id,
      payload: {
        type: "task",
        step: i + 1,
        task: step.task,
        assignee: step.agent,
      },
    });

    console.log(`  📤 Sent to ${targetAgent.name}: ${message.id}`);
  }

  // Итоговое сообщение
  await client.sendMessage({
    threadId: thread.id,
    fromAgentId: orchestrator.id,
    payload: {
      type: "workflow_complete",
      title,
      stepsCount: steps.length,
    },
  });

  console.log(`\n✨ Workflow "${title}" completed!`);
  console.log(`   View thread: http://localhost:3333 → Thread ${thread.id}`);
}

// Example workflow
const devWorkflow: WorkflowStep[] = [
  { agent: "po", task: "Define requirements for new feature" },
  { agent: "architect", task: "Create technical design" },
  { agent: "dev", task: "Implement the feature" },
  { agent: "qa", task: "Test the implementation" },
  { agent: "devops", task: "Deploy to staging" },
];

runWorkflow("Feature Development Workflow", devWorkflow).catch(console.error);
