#!/usr/bin/env tsx
/**
 * Orchestrator Workflow Script
 *
 * Phase 7 — Full workflow orchestration:
 * 1. Create workflow thread
 * 2. Send task to PO → await response
 * 3. Dispatch Architect → await response
 * 4. Dispatch Dev → await response
 * 5. Dispatch QA → await response
 * 6. Close thread
 */

import "dotenv/config";
import { createClient, type Agent, type Message } from "../lib/sdk/index.js";

const client = createClient(process.env.MESSAGE_BUS_URL ?? "http://localhost:3333");

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface WorkflowConfig {
  title: string;
  description: string;
  steps: WorkflowStep[];
  responseTimeout?: number;
}

interface WorkflowStep {
  role: string;
  task: string;
  waitForResponse?: boolean;
}

interface StepResult {
  step: WorkflowStep;
  agent: Agent | null;
  sent: Message | null;
  response: Message | null;
  status: "success" | "skipped" | "timeout" | "no_agent";
}

// ─────────────────────────────────────────────────────────────
// Orchestrator
// ─────────────────────────────────────────────────────────────

async function runWorkflow(config: WorkflowConfig): Promise<void> {
  const { title, description, steps, responseTimeout = 30000 } = config;

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log(`║  🔄 ORCHESTRATOR WORKFLOW                                  ║`);
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`\n📋 Workflow: ${title}`);
  console.log(`   ${description}\n`);

  // 1. Get all agents
  const agents = await client.listAgents();
  const agentByRole = new Map<string, Agent>();
  for (const agent of agents) {
    agentByRole.set(agent.role, agent);
  }

  console.log(`👥 Available agents: ${agents.map((a) => a.role).join(", ")}\n`);

  // 2. Get or create orchestrator
  let orchestrator = agentByRole.get("orchestrator");
  if (!orchestrator) {
    orchestrator = await client.registerAgent({
      name: "workflow-orchestrator",
      role: "orchestrator",
    });
    console.log(`✅ Created orchestrator agent: ${orchestrator.id}\n`);
  }

  // 3. Create workflow thread
  const thread = await client.createThread({ title });
  console.log(`📂 Thread created: ${thread.id}\n`);

  // 4. Send initial message
  await client.sendMessage({
    threadId: thread.id,
    fromAgentId: orchestrator.id,
    payload: {
      type: "workflow_start",
      title,
      description,
      stepsCount: steps.length,
      timestamp: new Date().toISOString(),
    },
  });

  // 5. Execute steps
  const results: StepResult[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNum = i + 1;

    console.log(`\n─────────────────────────────────────────────────────────────`);
    console.log(`Step ${stepNum}/${steps.length}: ${step.task}`);
    console.log(`Target: ${step.role}`);

    const targetAgent = agentByRole.get(step.role);

    if (!targetAgent) {
      console.log(`⚠️  No agent with role "${step.role}" found. Skipping.`);
      results.push({
        step,
        agent: null,
        sent: null,
        response: null,
        status: "no_agent",
      });
      continue;
    }

    // Send task
    const sent = await client.sendMessage({
      threadId: thread.id,
      fromAgentId: orchestrator.id,
      toAgentId: targetAgent.id,
      payload: {
        type: "task",
        step: stepNum,
        task: step.task,
        assignee: step.role,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`📤 Sent to ${targetAgent.name} (${targetAgent.id})`);

    // Wait for response if needed
    let response: Message | null = null;

    if (step.waitForResponse !== false) {
      console.log(`⏳ Waiting for response (timeout: ${responseTimeout / 1000}s)...`);

      response = await client.waitForResponse(
        thread.id,
        targetAgent.id,
        sent.id,
        { timeout: responseTimeout, pollInterval: 1000 }
      );

      if (response) {
        console.log(`✅ Response received: ${response.id}`);
        console.log(`   Payload: ${JSON.stringify(response.payload)}`);
        results.push({ step, agent: targetAgent, sent, response, status: "success" });
      } else {
        console.log(`⚠️  Timeout - no response received`);
        results.push({ step, agent: targetAgent, sent, response: null, status: "timeout" });
      }
    } else {
      console.log(`📨 Dispatched (no wait)`);
      results.push({ step, agent: targetAgent, sent, response: null, status: "success" });
    }
  }

  // 6. Send completion message
  await client.sendMessage({
    threadId: thread.id,
    fromAgentId: orchestrator.id,
    payload: {
      type: "workflow_complete",
      title,
      summary: {
        total: steps.length,
        success: results.filter((r) => r.status === "success").length,
        timeout: results.filter((r) => r.status === "timeout").length,
        skipped: results.filter((r) => r.status === "no_agent").length,
      },
      timestamp: new Date().toISOString(),
    },
  });

  // 7. Close thread
  await client.closeThread(thread.id);
  console.log(`\n✅ Thread closed: ${thread.id}`);

  // 8. Summary
  printSummary(title, thread.id, results);
}

function printSummary(title: string, threadId: string, results: StepResult[]): void {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  📊 WORKFLOW SUMMARY                                       ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log(`Workflow: ${title}`);
  console.log(`Thread:   ${threadId}\n`);

  console.log("Steps:");
  console.log("┌─────┬──────────────┬────────────────────────────┬──────────┐");
  console.log("│  #  │ Agent        │ Task                       │ Status   │");
  console.log("├─────┼──────────────┼────────────────────────────┼──────────┤");

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const num = String(i + 1).padStart(3);
    const agent = (r.agent?.role ?? "-").padEnd(12).slice(0, 12);
    const task = r.step.task.padEnd(26).slice(0, 26);
    const status = statusIcon(r.status);
    console.log(`│ ${num} │ ${agent} │ ${task} │ ${status.padEnd(8)} │`);
  }

  console.log("└─────┴──────────────┴────────────────────────────┴──────────┘\n");

  const success = results.filter((r) => r.status === "success").length;
  const timeout = results.filter((r) => r.status === "timeout").length;
  const skipped = results.filter((r) => r.status === "no_agent").length;

  console.log(`Total: ${results.length} | ✅ ${success} | ⏱️ ${timeout} | ⏭️ ${skipped}\n`);
  console.log(`View: http://localhost:3333 → Thread ${threadId}`);
}

function statusIcon(status: StepResult["status"]): string {
  switch (status) {
    case "success":
      return "✅ OK";
    case "timeout":
      return "⏱️ TIMEOUT";
    case "no_agent":
      return "⏭️ SKIP";
    case "skipped":
      return "⏭️ SKIP";
  }
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

const featureWorkflow: WorkflowConfig = {
  title: "Feature Development Workflow",
  description: "End-to-end feature development with all agents",
  responseTimeout: 10000, // 10s for demo (agents won't respond automatically)
  steps: [
    {
      role: "po",
      task: "Define requirements for the feature",
      waitForResponse: true,
    },
    {
      role: "architect",
      task: "Create technical design and ADR",
      waitForResponse: true,
    },
    {
      role: "dev",
      task: "Implement the feature",
      waitForResponse: true,
    },
    {
      role: "qa",
      task: "Test and validate implementation",
      waitForResponse: true,
    },
    {
      role: "devops",
      task: "Deploy to staging environment",
      waitForResponse: false, // Fire and forget
    },
  ],
};

// Allow custom workflow from args
const customTitle = process.argv[2];
if (customTitle) {
  featureWorkflow.title = customTitle;
}

runWorkflow(featureWorkflow).catch((err) => {
  console.error("\n❌ Workflow failed:", err);
  process.exit(1);
});
