import { z } from "zod";

export const sendMessageSchema = z.object({
  threadId: z.string().uuid(),
  fromAgentId: z.string().uuid(),
  toAgentId: z.string().uuid().optional().nullable(),
  payload: z.unknown(),
  parentId: z.string().uuid().optional().nullable(),
});

export const messageIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const inboxQuerySchema = z.object({
  agentId: z.string().uuid(),
});
