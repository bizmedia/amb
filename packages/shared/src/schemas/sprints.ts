import { z } from "zod";

export const SPRINT_STATUSES = ["PLANNED", "ACTIVE", "COMPLETED"] as const;

export const sprintStatusSchema = z.enum(SPRINT_STATUSES);

export const createSprintSchema = z.object({
  name: z.string().trim().min(1).max(255),
  goal: z.string().max(5000).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export const updateSprintSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    goal: z.string().max(5000).optional().nullable(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    status: sprintStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listSprintsQuerySchema = z.object({
  status: sprintStatusSchema.optional(),
});
