/**
 * Seed agents from .cursor/agents/registry.json into the Message Bus API.
 * Reads registry from current working directory (project that installed the package).
 */

import "dotenv/config";
import { loadOrCreateRegistry, Registry } from "./agent-registry";

const BASE_URL = process.env.MESSAGE_BUS_URL ?? "http://localhost:3333";
const API_URL = `${BASE_URL}/api/agents`;
const PROJECT_ID = process.env.MESSAGE_BUS_PROJECT_ID;

type Agent = {
  id: string;
  name: string;
  role: string;
};

async function getExistingAgents(): Promise<Map<string, Agent>> {
  try {
    const res = await fetch(API_URL, {
      headers: PROJECT_ID ? { "x-project-id": PROJECT_ID } : undefined,
    });
    if (!res.ok) return new Map();
    const json = await res.json();
    const agents = json.data as Agent[];
    return new Map(agents.map((a) => [a.role, a]));
  } catch {
    return new Map();
  }
}

export async function runSeedAgents(registryPath?: string): Promise<void> {
  const loaded = await loadOrCreateRegistry(registryPath);
  const registry = loaded.registry;

  console.log(`🌱 Seeding agents for project: ${registry.project}\n`);

  if (!registry.agents.length) {
    console.log("⚠️  No agents found. Add *.md files to .cursor/agents or create registry.json.");
    return;
  }

  const existingAgents = await getExistingAgents();
  console.log(`📋 Existing agents: ${existingAgents.size}\n`);

  let created = 0;
  let skipped = 0;

  for (const agent of registry.agents) {
    const existing = existingAgents.get(agent.role);
    if (existing) {
      console.log(`⏭️  Skip (exists): ${agent.role} → ${existing.id}`);
      skipped++;
      continue;
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(PROJECT_ID ? { "x-project-id": PROJECT_ID } : {}),
      },
      body: JSON.stringify({
        name: agent.name,
        role: agent.role,
      }),
    });

    if (!res.ok) {
      console.error(`❌ Failed to seed agent ${agent.id}`);
      console.error(await res.text());
      continue;
    }

    const json = await res.json();
    console.log(`✅ Created: ${agent.role} → ${json.data.id}`);
    created++;
  }

  console.log("\n────────────────────────────────────");
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log("🎉 Agent seeding complete.");
}
