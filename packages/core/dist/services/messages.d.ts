import type { MessageBusStorage } from "../storage/interface";
export type SendMessageInput = {
    projectId: string;
    threadId: string;
    fromAgentId: string;
    toAgentId?: string | null;
    payload: unknown;
    parentId?: string | null;
};
export declare function sendMessage(storage: MessageBusStorage, input: SendMessageInput): Promise<import("@amb-app/shared").Message>;
export declare function getInboxMessages(storage: MessageBusStorage, projectId: string, agentId: string): Promise<import("@amb-app/shared").Message[]>;
export declare function ackMessage(storage: MessageBusStorage, projectId: string, messageId: string): Promise<import("@amb-app/shared").Message>;
export declare function retryTimedOutMessages(storage: MessageBusStorage, projectId: string): Promise<{
    retried: number;
    movedToDlq: number;
}>;
export declare function getDlqMessages(storage: MessageBusStorage, projectId: string): Promise<import("@amb-app/shared").Message[]>;
export declare function cleanupOldMessages(storage: MessageBusStorage, projectId: string, retentionDays?: number): Promise<{
    deleted: number;
}>;
export declare function retryDlqMessage(storage: MessageBusStorage, projectId: string, messageId: string): Promise<import("@amb-app/shared").Message>;
export declare function retryAllDlqMessages(storage: MessageBusStorage, projectId: string): Promise<{
    retried: number;
}>;
//# sourceMappingURL=messages.d.ts.map