import "dotenv/config";
import { loadOrCreateRegistry } from "./agent-registry";
import { runSeedAgents } from "./seed-agents";
import { runSeedThreads } from "./seed-threads";

const BASE_URL = process.env.MESSAGE_BUS_URL ?? "http://localhost:3333";
const PROJECT_ID = process.env.MESSAGE_BUS_PROJECT_ID;

async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function runSetup(registryPath?: string): Promise<void> {
  console.log("AMB MCP setup\n");

  if (!PROJECT_ID) {
    console.error("MESSAGE_BUS_PROJECT_ID is not set.");
    console.error("Create a project in the AMB Dashboard, copy its Project ID, and set MESSAGE_BUS_PROJECT_ID.");
    process.exit(1);
  }

  const isHealthy = await checkHealth();
  if (!isHealthy) {
    console.error(`AMB API is not reachable at ${BASE_URL}.`);
    console.error("Start the AMB stack first, then run this command again.");
    process.exit(1);
  }

  const loaded = await loadOrCreateRegistry(registryPath);

  console.log(`Using AMB URL: ${BASE_URL}`);
  console.log(`Using Project ID: ${PROJECT_ID}`);
  console.log(`Using registry: ${loaded.registryFile}`);
  console.log(`Detected agents: ${loaded.registry.agents.length}\n`);

  if (!loaded.registry.agents.length) {
    console.error("No agents found.");
    console.error("Add .md agent files to .cursor/agents or create registry.json, then run setup again.");
    process.exit(1);
  }

  await runSeedAgents(registryPath);
  console.log("");
  await runSeedThreads(registryPath);

  console.log("\nNext:");
  console.log(`- Open Dashboard: ${BASE_URL}`);
  console.log("- Select the same project and confirm your agents are visible");
  console.log("- Ask your orchestrator to run the first workflow");
}
