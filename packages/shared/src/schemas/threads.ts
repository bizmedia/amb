import { z } from "zod";

export const createThreadSchema = z.object({
  title: z.string().min(1),
  status: z.enum(["open", "closed"]).optional().default("open"),
});

export const updateThreadSchema = z.object({
  status: z.enum(["open", "closed", "archived"]),
});

export const threadIdParamsSchema = z.object({
  id: z.string().uuid(),
});
