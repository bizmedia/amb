"use strict";
/**
 * Seed agents from .cursor/agents/registry.json into the Message Bus API.
 * Reads registry from current working directory (project that installed the package).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeedAgents = runSeedAgents;
const agent_registry_1 = require("./agent-registry");
const fetch_message_bus_client_1 = require("./client/fetch-message-bus-client");
const message_bus_config_1 = require("./config/message-bus-config");
const load_project_env_1 = require("./load-project-env");
const registry_agent_sync_1 = require("./registry-agent-sync");
(0, load_project_env_1.loadProjectEnv)();
async function runSeedAgents(registryPath) {
    const loaded = await (0, agent_registry_1.loadOrCreateRegistry)(registryPath);
    const registry = loaded.registry;
    console.log(`🌱 Seeding agents for project: ${registry.project}\n`);
    if (!registry.agents.length) {
        console.log("⚠️  No agents found. Add *.md files to .cursor/agents or create registry.json.");
        return;
    }
    const config = (0, message_bus_config_1.getMessageBusConfig)();
    const client = (0, fetch_message_bus_client_1.createFetchMessageBusClient)(config);
    const existingBefore = await client.requestJson("/api/agents");
    const existingByRole = new Map(existingBefore.map((a) => [a.role, a]));
    console.log(`📋 Existing agents: ${existingBefore.length}\n`);
    for (const agent of registry.agents) {
        const row = existingByRole.get(agent.role);
        if (row) {
            console.log(`⏭️  Skip (exists): ${agent.role} → ${row.id}`);
        }
    }
    const { created, skipped, createdRows } = await (0, registry_agent_sync_1.syncRegistryAgents)(client, registry);
    for (const row of createdRows) {
        console.log(`✅ Created: ${row.role} → ${row.id}`);
    }
    console.log("\n────────────────────────────────────");
    console.log(`✅ Created: ${created}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log("🎉 Agent seeding complete.");
}
