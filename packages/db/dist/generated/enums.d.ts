export declare const IssueState: {
    readonly BACKLOG: "BACKLOG";
    readonly TODO: "TODO";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly DONE: "DONE";
};
export type IssueState = (typeof IssueState)[keyof typeof IssueState];
export declare const IssuePriority: {
    readonly NONE: "NONE";
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly URGENT: "URGENT";
};
export type IssuePriority = (typeof IssuePriority)[keyof typeof IssuePriority];
//# sourceMappingURL=enums.d.ts.map