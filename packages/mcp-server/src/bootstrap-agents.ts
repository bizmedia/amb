import type { MessageBusClient } from "./client/message-bus-client";
import type { MessageBusConfig } from "./config/message-bus-config";
import { loadOrCreateRegistry } from "./agent-registry";
import { syncRegistryAgents } from "./registry-agent-sync";

let bootstrapPromise: Promise<void> | null = null;

/**
 * Один раз за процесс MCP: загружает registry с диска и досоздаёт агентов в проекте шины.
 * Без MESSAGE_BUS_PROJECT_ID контекст проекта в API не задаётся — пропускаем.
 */
export function ensureRegistryAgentsOnFirstToolCall(
  client: MessageBusClient,
  config: MessageBusConfig
): Promise<void> {
  if (!config.defaultProjectId) {
    return Promise.resolve();
  }

  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap(client, config).catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }

  return bootstrapPromise;
}

async function runBootstrap(client: MessageBusClient, config: MessageBusConfig): Promise<void> {
  const loaded = await loadOrCreateRegistry();
  const summary = await syncRegistryAgents(client, loaded.registry);

  if (process.env.AMB_MCP_BOOTSTRAP_LOG === "1") {
    console.error(
      `[amb-mcp] Registry agents synced (project ${config.defaultProjectId}): created=${summary.created} skipped=${summary.skipped}`
    );
  }
}
