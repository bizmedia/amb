import fs from "fs/promises";
import path from "path";

const API_URL = process.env.AGENT_BUS_URL ?? "http://localhost:3000/api/agents";

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

async function main() {
  const registryPath = path.resolve(".cursor/agents/registry.json");

  const raw = await fs.readFile(registryPath, "utf-8");
  const registry = JSON.parse(raw) as Registry;

  console.log(`🌱 Seeding agents for project: ${registry.project}`);

  for (const agent of registry.agents) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: agent.name,
        role: agent.role,
        externalId: agent.id,
      }),
    });

    if (!res.ok) {
      console.error(`❌ Failed to seed agent ${agent.id}`);
      console.error(await res.text());
      continue;
    }

    const json = await res.json();
    console.log(`✅ Seeded agent: ${agent.id} → ${json.id}`);
  }

  console.log("🎉 Agent seeding complete.");
}

main().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
