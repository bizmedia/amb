/**
 * Seed agents from .cursor/agents/registry.json into the Message Bus API.
 * Reads registry from current working directory (project that installed the package).
 */

import { loadOrCreateRegistry } from "./agent-registry";
import { createFetchMessageBusClient } from "./client/fetch-message-bus-client";
import { getMessageBusConfig } from "./config/message-bus-config";
import { loadProjectEnv } from "./load-project-env";
import { syncRegistryAgents } from "./registry-agent-sync";

loadProjectEnv();

export async function runSeedAgents(registryPath?: string): Promise<void> {
  const loaded = await loadOrCreateRegistry(registryPath);
  const registry = loaded.registry;

  console.log(`🌱 Seeding agents for project: ${registry.project}\n`);

  if (!registry.agents.length) {
    console.log("⚠️  No agents found. Add *.md files to .cursor/agents or create registry.json.");
    return;
  }

  const config = getMessageBusConfig();
  const client = createFetchMessageBusClient(config);

  const existingBefore = await client.requestJson<Array<{ id: string; role: string }>>("/api/agents");
  const existingByRole = new Map(existingBefore.map((a) => [a.role, a]));
  console.log(`📋 Existing agents: ${existingBefore.length}\n`);

  for (const agent of registry.agents) {
    const row = existingByRole.get(agent.role);
    if (row) {
      console.log(`⏭️  Skip (exists): ${agent.role} → ${row.id}`);
    }
  }

  const { created, skipped, createdRows } = await syncRegistryAgents(client, registry);

  for (const row of createdRows) {
    console.log(`✅ Created: ${row.role} → ${row.id}`);
  }

  console.log("\n────────────────────────────────────");
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log("🎉 Agent seeding complete.");
}
