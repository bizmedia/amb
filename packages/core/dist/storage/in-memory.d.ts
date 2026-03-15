import type { Agent, Message, Thread } from "@amb-app/shared";
import type { CreateAgentInput, CreateThreadInput, MessageBusStorage } from "./interface";
export declare class InMemoryMessageBusStorage implements MessageBusStorage {
    private agents;
    private threads;
    private messages;
    listAgents(projectId: string): Promise<Agent[]>;
    createAgent(input: CreateAgentInput): Promise<Agent>;
    searchAgents(projectId: string, query: string): Promise<Agent[]>;
    getAgentById(projectId: string, agentId: string): Promise<Agent | null>;
    listThreads(projectId: string): Promise<Thread[]>;
    createThread(input: CreateThreadInput): Promise<Thread>;
    getThreadById(projectId: string, threadId: string): Promise<Thread | null>;
    listThreadMessages(projectId: string, threadId: string): Promise<Message[]>;
    updateThreadStatus(projectId: string, threadId: string, status: "open" | "closed" | "archived"): Promise<Thread>;
    deleteThread(projectId: string, threadId: string): Promise<void>;
    createMessage(data: {
        projectId: string;
        threadId: string;
        fromAgentId: string;
        toAgentId: string | null;
        payload: unknown;
        parentId: string | null;
        status: string;
        retries: number;
    }): Promise<Message>;
    getMessageById(projectId: string, messageId: string): Promise<Message | null>;
    updateMessageStatus(projectId: string, messageId: string, status: string, retries?: number): Promise<Message>;
    getInboxAndMarkDelivered(projectId: string, agentId: string): Promise<Message[]>;
    findMessages(projectId: string, filter: {
        status?: string;
        toAgentId?: string | null;
        fromAgentId?: {
            not: string;
        };
        createdAtLt?: Date;
    }): Promise<Message[]>;
    updateManyMessages(projectId: string, filter: {
        status: string;
        toAgentId?: string | null;
        fromAgentId?: {
            not: string;
        };
    }, data: {
        status: string;
    }): Promise<number>;
    deleteManyMessages(projectId: string, filter: {
        status: {
            in: string[];
        };
        createdAtLt: Date;
    }): Promise<number>;
    updateManyMessagesToStatus(projectId: string, filter: {
        status: string;
    }, data: {
        status: string;
        retries?: number;
    }): Promise<number>;
}
//# sourceMappingURL=in-memory.d.ts.map