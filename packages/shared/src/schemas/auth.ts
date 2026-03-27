import { z } from "zod";

export const userRoleSchema = z.enum(["tenant-admin", "project-admin", "reader"]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(256),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(256),
    newPassword: z.string().min(8).max(256),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export const issueProjectTokenSchema = z.object({
  name: z.string().trim().min(1).max(120),
  projectId: z.string().uuid(),
  expiresIn: z.number().int().positive().max(60 * 60 * 24 * 365).optional(),
});

export const adminIssueProjectTokenSchema = z.object({
  name: z.string().trim().min(1).max(120),
  expiresIn: z.number().int().positive().max(60 * 60 * 24 * 365).optional(),
});

export const projectTokenParamsSchema = z.object({
  projectId: z.string().uuid(),
  tokenId: z.string().uuid(),
});
