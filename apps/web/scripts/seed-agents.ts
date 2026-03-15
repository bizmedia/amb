import "dotenv/config";
import fs from "fs/promises";
import path from "path";

const BASE_URL = process.env.MESSAGE_BUS_URL ?? "http://localhost:3333";
const API_URL = `${BASE_URL}/api/agents`;
const PROJECT_ID = process.env.MESSAGE_BUS_PROJECT_ID;

type Registry = {
  project: string;
  mode: string;
  agents: {
    id: string;
    name: string;
    role: string;
    defaultThreads?: string[];
  }[];
};

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

async function main() {
  const registryPath = path.resolve(".cursor/agents/registry.json");

  const raw = await fs.readFile(registryPath, "utf-8");
  const registry = JSON.parse(raw) as Registry;

  console.log(`🌱 Seeding agents for project: ${registry.project}\n`);

  // Get existing agents to avoid duplicates
  const existingAgents = await getExistingAgents();
  console.log(`📋 Existing agents: ${existingAgents.size}\n`);

  let created = 0;
  let skipped = 0;

  for (const agent of registry.agents) {
    // Check if agent with this role already exists
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

main().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
