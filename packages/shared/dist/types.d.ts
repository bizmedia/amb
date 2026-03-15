export type Agent = {
    id: string;
    projectId: string;
    name: string;
    role: string;
    status: string;
    capabilities: unknown;
    createdAt: string;
    lastSeen: string | null;
};
export type Thread = {
    id: string;
    projectId: string;
    title: string;
    status: "open" | "closed" | "archived";
    createdAt: string;
};
export type Message = {
    id: string;
    projectId: string;
    threadId: string;
    fromAgentId: string;
    toAgentId: string | null;
    payload: unknown;
    status: string;
    retries: number;
    parentId: string | null;
    createdAt: string;
};
export type IssueState = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type IssuePriority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type IssueAssignee = {
    id: string;
    name: string;
    role: string;
};
export type Issue = {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    state: IssueState;
    priority: IssuePriority;
    assigneeId: string | null;
    assignee: IssueAssignee | null;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
};
//# sourceMappingURL=types.d.ts.map