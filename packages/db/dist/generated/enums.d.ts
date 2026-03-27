export declare const EpicStatus: {
    readonly OPEN: "OPEN";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly DONE: "DONE";
    readonly ARCHIVED: "ARCHIVED";
};
export type EpicStatus = (typeof EpicStatus)[keyof typeof EpicStatus];
export declare const SprintStatus: {
    readonly PLANNED: "PLANNED";
    readonly ACTIVE: "ACTIVE";
    readonly COMPLETED: "COMPLETED";
};
export type SprintStatus = (typeof SprintStatus)[keyof typeof SprintStatus];
export declare const TaskState: {
    readonly BACKLOG: "BACKLOG";
    readonly TODO: "TODO";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly DONE: "DONE";
};
export type TaskState = (typeof TaskState)[keyof typeof TaskState];
export declare const TaskPriority: {
    readonly NONE: "NONE";
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly URGENT: "URGENT";
};
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];
//# sourceMappingURL=enums.d.ts.map