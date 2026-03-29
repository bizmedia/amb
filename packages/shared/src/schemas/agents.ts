import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  capabilities: z.unknown().optional().nullable(),
});

export const updateAgentSchema = z
  .object({
    name: z.string().min(1).optional(),
    role: z.string().min(1).optional(),
  })
  .refine((v) => v.name !== undefined || v.role !== undefined, {
    message: "At least one of name or role is required",
  });
