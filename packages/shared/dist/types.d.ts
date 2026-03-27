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
export type TaskState = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskAssignee = {
    id: string;
    name: string;
    role: string;
};
export type EpicStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "ARCHIVED";
export type Epic = {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    status: EpicStatus;
    createdAt: string;
    updatedAt: string;
};
/** Epic relation as returned on Task (API include select). */
export type TaskEpic = Pick<Epic, "id" | "title" | "status">;
export type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED";
export type Sprint = {
    id: string;
    projectId: string;
    name: string;
    goal: string | null;
    startDate: string | null;
    endDate: string | null;
    status: SprintStatus;
    createdAt: string;
    updatedAt: string;
};
/** Sprint relation as returned on Task (API include select). */
export type TaskSprint = Pick<Sprint, "id" | "name" | "status">;
export type Task = {
    id: string;
    projectId: string;
    key: string | null;
    title: string;
    description: string | null;
    state: TaskState;
    priority: TaskPriority;
    assigneeId: string | null;
    assignee: TaskAssignee | null;
    epicId: string | null;
    epic: TaskEpic | null;
    sprintId: string | null;
    sprint: TaskSprint | null;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
};
//# sourceMappingURL=types.d.ts.map