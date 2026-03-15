import type { MessageBusStorage } from "../storage/interface";
export type CreateAgentInput = {
    projectId: string;
    name: string;
    role: string;
    capabilities?: unknown;
};
export declare function listAgents(storage: MessageBusStorage, projectId: string): Promise<import("@amb-app/shared").Agent[]>;
export declare function createAgent(storage: MessageBusStorage, input: CreateAgentInput): Promise<import("@amb-app/shared").Agent>;
export declare function searchAgents(storage: MessageBusStorage, projectId: string, query: string): Promise<import("@amb-app/shared").Agent[]>;
//# sourceMappingURL=agents.d.ts.map