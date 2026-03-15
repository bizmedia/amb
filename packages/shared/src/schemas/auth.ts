import { z } from "zod";

export const userRoleSchema = z.enum(["tenant-admin", "project-admin", "reader"]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(256),
});

export const issueProjectTokenSchema = z.object({
  projectId: z.string().uuid(),
  expiresIn: z.number().int().positive().max(60 * 60 * 24 * 365).optional(),
});
