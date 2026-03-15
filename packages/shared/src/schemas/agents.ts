import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  capabilities: z.unknown().optional().nullable(),
});
