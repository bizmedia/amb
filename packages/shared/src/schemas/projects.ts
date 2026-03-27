import { z } from "zod";

export const taskPrefixSchema = z
  .string()
  .regex(/^[A-Z]{2,5}$/, "Must be 2-5 uppercase Latin letters");

export const createProjectSchema = z.object({
  name: z.string().min(1).max(80),
  taskPrefix: taskPrefixSchema.optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    taskPrefix: taskPrefixSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
