import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATES } from "../constants";

export const taskStateSchema = z.enum(TASK_STATES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  state: taskStateSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().max(5000).optional().nullable(),
    state: taskStateSchema.optional(),
    priority: taskPrioritySchema.optional(),
    assigneeId: z.string().uuid().optional().nullable(),
    epicId: z.string().uuid().optional().nullable(),
    sprintId: z.string().uuid().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const taskKeySchema = z
  .string()
  .regex(/^[A-Z]{2,5}-\d{4,}$/, "Must match format PPP-0001");

export const listTasksQuerySchema = z.object({
  state: taskStateSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assignee: z.string().uuid().optional(),
  epicId: z.string().uuid().optional(),
  sprintId: z.string().uuid().optional(),
  key: z.string().optional(),
  search: z.string().optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
});
