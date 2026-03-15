import { z } from "zod";
import { ISSUE_PRIORITIES, ISSUE_STATES } from "../constants";

export const issueStateSchema = z.enum(ISSUE_STATES);
export const issuePrioritySchema = z.enum(ISSUE_PRIORITIES);

export const createIssueSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  state: issueStateSchema.optional(),
  priority: issuePrioritySchema.optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateIssueSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().max(5000).optional().nullable(),
    state: issueStateSchema.optional(),
    priority: issuePrioritySchema.optional(),
    assigneeId: z.string().uuid().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listIssuesQuerySchema = z.object({
  state: issueStateSchema.optional(),
  priority: issuePrioritySchema.optional(),
  assignee: z.string().uuid().optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
});
