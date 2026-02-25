/**
 * Seed agents from .cursor/agents/registry.json into the Message Bus API.
 * Reads registry from current working directory (project that installed the package).
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
const BASE_URL = process.env.MESSAGE_BUS_URL ?? "http://localhost:3333";
const API_URL = `${BASE_URL}/api/agents`;
async function getExistingAgents() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok)
            return new Map();
        const json = await res.json();
        const agents = json.data;
        return new Map(agents.map((a) => [a.role, a]));
    }
    catch {
        return new Map();
    }
}
/** Разрешает путь к файлу registry: если передан каталог — ищет registry.json внутри. */
async function resolveRegistryFile(registryPath) {
    if (!registryPath) {
        return path.resolve(process.cwd(), ".cursor/agents/registry.json");
    }
    const resolved = path.resolve(process.cwd(), registryPath);
    const stat = await fs.stat(resolved).catch(() => null);
    if (stat?.isDirectory()) {
        return path.join(resolved, "registry.json");
    }
    return resolved;
}
export async function runSeedAgents(registryPath) {
    const resolved = await resolveRegistryFile(registryPath);
    const raw = await fs.readFile(resolved, "utf-8");
    const registry = JSON.parse(raw);
    console.log(`🌱 Seeding agents for project: ${registry.project}\n`);
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
            headers: { "Content-Type": "application/json" },
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
