import type { MessageBusStorage } from "../storage/interface";

/** Input for creating an agent via the agents service. */
export type CreateAgentInput = {
  projectId: string;
  name: string;
  role: string;
  capabilities?: unknown;
};

/** List all agents in the provided project scope. */
export function listAgents(storage: MessageBusStorage, projectId: string) {
  return storage.listAgents(projectId);
}

/** Create and persist a new agent in the provided project scope. */
export function createAgent(storage: MessageBusStorage, input: CreateAgentInput) {
  return storage.createAgent(input);
}

/** Search agents by text query in the provided project scope. */
export function searchAgents(storage: MessageBusStorage, projectId: string, query: string) {
  return storage.searchAgents(projectId, query);
}
