"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listIssuesQuerySchema = exports.updateIssueSchema = exports.createIssueSchema = exports.issuePrioritySchema = exports.issueStateSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
exports.issueStateSchema = zod_1.z.enum(constants_1.ISSUE_STATES);
exports.issuePrioritySchema = zod_1.z.enum(constants_1.ISSUE_PRIORITIES);
exports.createIssueSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).max(255),
    description: zod_1.z.string().max(5000).optional().nullable(),
    state: exports.issueStateSchema.optional(),
    priority: exports.issuePrioritySchema.optional(),
    assigneeId: zod_1.z.string().uuid().optional().nullable(),
    dueDate: zod_1.z.coerce.date().optional().nullable(),
});
exports.updateIssueSchema = zod_1.z
    .object({
    title: zod_1.z.string().trim().min(1).max(255).optional(),
    description: zod_1.z.string().max(5000).optional().nullable(),
    state: exports.issueStateSchema.optional(),
    priority: exports.issuePrioritySchema.optional(),
    assigneeId: zod_1.z.string().uuid().optional().nullable(),
    dueDate: zod_1.z.coerce.date().optional().nullable(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});
exports.listIssuesQuerySchema = zod_1.z.object({
    state: exports.issueStateSchema.optional(),
    priority: exports.issuePrioritySchema.optional(),
    assignee: zod_1.z.string().uuid().optional(),
    dueFrom: zod_1.z.coerce.date().optional(),
    dueTo: zod_1.z.coerce.date().optional(),
});
