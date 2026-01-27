import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { NotFoundError } from "@/lib/services/errors";

export type SendMessageInput = {
  threadId: string;
  fromAgentId: string;
  toAgentId?: string | null;
  payload: Prisma.InputJsonValue;
  parentId?: string | null;
};

async function ensureThreadExists(threadId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
  });

  if (!thread) {
    throw new NotFoundError("Thread");
  }
}

async function ensureAgentExists(agentId: string, label: "From agent" | "To agent") {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    throw new NotFoundError(label);
  }
}

async function ensureMessageExists(messageId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new NotFoundError("Parent message");
  }
}

export async function sendMessage(input: SendMessageInput) {
  await ensureThreadExists(input.threadId);
  await ensureAgentExists(input.fromAgentId, "From agent");

  if (input.toAgentId) {
    await ensureAgentExists(input.toAgentId, "To agent");
  }

  if (input.parentId) {
    await ensureMessageExists(input.parentId);
  }

  return prisma.message.create({
    data: {
      threadId: input.threadId,
      fromAgentId: input.fromAgentId,
      toAgentId: input.toAgentId ?? null,
      payload: input.payload,
      parentId: input.parentId ?? null,
      status: "pending",
      retries: 0,
    },
  });
}
