import type { MessageBusStorage } from "../storage/interface";
export type CreateThreadInput = {
    projectId: string;
    title: string;
    status: "open" | "closed";
};
export declare function listThreads(storage: MessageBusStorage, projectId: string): Promise<import("@amb-app/shared").Thread[]>;
export declare function createThread(storage: MessageBusStorage, input: CreateThreadInput): Promise<import("@amb-app/shared").Thread>;
export declare function getThreadById(storage: MessageBusStorage, projectId: string, threadId: string): Promise<import("@amb-app/shared").Thread>;
export declare function listThreadMessages(storage: MessageBusStorage, projectId: string, threadId: string): Promise<import("@amb-app/shared").Message[]>;
export declare function updateThreadStatus(storage: MessageBusStorage, projectId: string, threadId: string, status: "open" | "closed" | "archived"): Promise<import("@amb-app/shared").Thread>;
export declare function deleteThread(storage: MessageBusStorage, projectId: string, threadId: string): Promise<void>;
//# sourceMappingURL=threads.d.ts.map