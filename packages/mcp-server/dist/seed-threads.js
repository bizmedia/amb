"use strict";
/**
 * Seed default threads from .cursor/agents/registry.json into the Message Bus API.
 * Reads registry from current working directory (project that installed the package).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeedThreads = runSeedThreads;
require("dotenv/config");
const agent_registry_1 = require("./agent-registry");
const API_URL = process.env.MESSAGE_BUS_URL ?? "http://localhost:3333";
const PROJECT_ID = process.env.MESSAGE_BUS_PROJECT_ID;
async function createThread(title) {
    try {
        const res = await fetch(`${API_URL}/api/threads`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(PROJECT_ID ? { "x-project-id": PROJECT_ID } : {}),
            },
            body: JSON.stringify({ title, status: "open" }),
        });
        if (!res.ok) {
            const text = await res.text();
            console.error(`   ❌ Failed: ${text}`);
            return null;
        }
        const json = await res.json();
        return json.data;
    }
    catch (err) {
        console.error(`   ❌ Error: ${err}`);
        return null;
    }
}
async function getExistingThreads() {
    try {
        const res = await fetch(`${API_URL}/api/threads`, {
            headers: PROJECT_ID ? { "x-project-id": PROJECT_ID } : undefined,
        });
        if (!res.ok)
            return new Set();
        const json = await res.json();
        return new Set(json.data.map((t) => t.title));
    }
    catch {
        return new Set();
    }
}
async function runSeedThreads(registryPath) {
    console.log("🌱 Seeding default threads...\n");
    const loaded = await (0, agent_registry_1.loadOrCreateRegistry)(registryPath);
    const registry = loaded.registry;
    const existingThreads = await getExistingThreads();
    console.log(`📋 Existing threads: ${existingThreads.size}\n`);
    let created = 0;
    let skipped = 0;
    const threadTitles = new Set();
    for (const agent of registry.agents) {
        if (agent.defaultThreads) {
            for (const thread of agent.defaultThreads) {
                threadTitles.add(thread);
            }
        }
    }
    console.log(`📝 Threads to seed: ${threadTitles.size}\n`);
    for (const title of threadTitles) {
        if (existingThreads.has(title)) {
            console.log(`⏭️  Skip (exists): ${title}`);
            skipped++;
            continue;
        }
        const thread = await createThread(title);
        if (thread) {
            console.log(`✅ Created: ${title} → ${thread.id}`);
            created++;
        }
    }
    const workflowThreads = ["general", "announcements", "incidents", "releases"];
    console.log("\n📂 Workflow threads:");
    for (const title of workflowThreads) {
        if (existingThreads.has(title) || threadTitles.has(title)) {
            console.log(`⏭️  Skip (exists): ${title}`);
            skipped++;
            continue;
        }
        const thread = await createThread(title);
        if (thread) {
            console.log(`✅ Created: ${title} → ${thread.id}`);
            created++;
        }
    }
    console.log("\n────────────────────────────────────");
    console.log(`✅ Created: ${created}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log("🎉 Thread seeding complete.");
}
