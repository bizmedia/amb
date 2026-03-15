import { z } from "zod";
export declare const issueStateSchema: z.ZodEnum<{
    BACKLOG: "BACKLOG";
    TODO: "TODO";
    IN_PROGRESS: "IN_PROGRESS";
    DONE: "DONE";
    CANCELLED: "CANCELLED";
}>;
export declare const issuePrioritySchema: z.ZodEnum<{
    NONE: "NONE";
    LOW: "LOW";
    MEDIUM: "MEDIUM";
    HIGH: "HIGH";
    URGENT: "URGENT";
}>;
export declare const createIssueSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    state: z.ZodOptional<z.ZodEnum<{
        BACKLOG: "BACKLOG";
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        DONE: "DONE";
        CANCELLED: "CANCELLED";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        NONE: "NONE";
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        URGENT: "URGENT";
    }>>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
}, z.core.$strip>;
export declare const updateIssueSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    state: z.ZodOptional<z.ZodEnum<{
        BACKLOG: "BACKLOG";
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        DONE: "DONE";
        CANCELLED: "CANCELLED";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        NONE: "NONE";
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        URGENT: "URGENT";
    }>>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
}, z.core.$strip>;
export declare const listIssuesQuerySchema: z.ZodObject<{
    state: z.ZodOptional<z.ZodEnum<{
        BACKLOG: "BACKLOG";
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        DONE: "DONE";
        CANCELLED: "CANCELLED";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        NONE: "NONE";
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        URGENT: "URGENT";
    }>>;
    assignee: z.ZodOptional<z.ZodString>;
    dueFrom: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    dueTo: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=issues.d.ts.map