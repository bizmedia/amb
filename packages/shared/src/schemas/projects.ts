import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(80),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(80),
});
