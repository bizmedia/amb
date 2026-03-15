import type { MessageBusStorage } from "../storage/interface";

export type CreateAgentInput = {
  projectId: string;
  name: string;
  role: string;
  capabilities?: unknown;
};

export function listAgents(storage: MessageBusStorage, projectId: string) {
  return storage.listAgents(projectId);
}

export function createAgent(storage: MessageBusStorage, input: CreateAgentInput) {
  return storage.createAgent(input);
}

export function searchAgents(storage: MessageBusStorage, projectId: string, query: string) {
  return storage.searchAgents(projectId, query);
}
