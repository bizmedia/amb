import { z } from "zod";

export const EPIC_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "DONE",
  "ARCHIVED",
] as const;

export const epicStatusSchema = z.enum(EPIC_STATUSES);

export const createEpicSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  status: epicStatusSchema.optional(),
});

export const updateEpicSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().max(5000).optional().nullable(),
    status: epicStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listEpicsQuerySchema = z.object({
  status: epicStatusSchema.optional(),
});
