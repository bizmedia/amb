import type { Registry } from "./agent-registry";
import type { MessageBusClient } from "./client/message-bus-client";

export type SyncRegistryAgentsSummary = {
  created: number;
  skipped: number;
};

/**
 * Регистрирует в API агентов из registry, если роли ещё нет в проекте (x-project-id на клиенте).
 */
export async function syncRegistryAgents(
  client: MessageBusClient,
  registry: Registry
): Promise<SyncRegistryAgentsSummary> {
  const existingAgents = await client.requestJson<Array<{ role: string }>>("/api/agents");
  const roleSet = new Set(existingAgents.map((a) => a.role));

  let created = 0;
  let skipped = 0;

  for (const agent of registry.agents) {
    if (roleSet.has(agent.role)) {
      skipped += 1;
      continue;
    }

    await client.requestJson("/api/agents", {
      method: "POST",
      body: JSON.stringify({
        name: agent.name,
        role: agent.role,
      }),
    });
    roleSet.add(agent.role);
    created += 1;
  }

  return { created, skipped };
}
