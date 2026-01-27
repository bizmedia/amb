import { prisma } from "@/lib/prisma";
import { Prisma } from "../../prisma/generated/client";
import { ConflictError, NotFoundError } from "@/lib/services/errors";

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

export async function getInboxMessages(agentId: string) {
  return prisma.$transaction(async (tx) => {
    // Mark pending messages as delivered
    await tx.message.updateMany({
      where: {
        toAgentId: agentId,
        status: "pending",
      },
      data: {
        status: "delivered",
      },
    });

    // Return all delivered (unacked) messages
    return tx.message.findMany({
      where: {
        toAgentId: agentId,
        status: "delivered",
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  });
}

export async function ackMessage(messageId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new NotFoundError("Message");
  }

  if (message.status === "ack") {
    return message;
  }

  if (message.status !== "delivered") {
    throw new ConflictError("Message", "Message must be delivered before ack");
  }

  return prisma.message.update({
    where: { id: messageId },
    data: { status: "ack" },
  });
}

const MAX_RETRIES = 3;
const DELIVERY_TIMEOUT_MS = 60_000; // 1 minute

export async function retryTimedOutMessages() {
  const timeoutThreshold = new Date(Date.now() - DELIVERY_TIMEOUT_MS);

  const timedOutMessages = await prisma.message.findMany({
    where: {
      status: "delivered",
      createdAt: { lt: timeoutThreshold },
    },
  });

  const results = {
    retried: 0,
    movedToDlq: 0,
  };

  for (const message of timedOutMessages) {
    const newRetries = message.retries + 1;

    if (newRetries >= MAX_RETRIES) {
      await prisma.message.update({
        where: { id: message.id },
        data: { status: "dlq", retries: newRetries },
      });
      results.movedToDlq++;
    } else {
      await prisma.message.update({
        where: { id: message.id },
        data: { status: "pending", retries: newRetries },
      });
      results.retried++;
    }
  }

  return results;
}

export async function getDlqMessages() {
  return prisma.message.findMany({
    where: { status: "dlq" },
    orderBy: { createdAt: "desc" },
  });
}

export async function cleanupOldMessages(retentionDays: number = 30) {
  const threshold = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const result = await prisma.message.deleteMany({
    where: {
      status: { in: ["ack", "dlq"] },
      createdAt: { lt: threshold },
    },
  });

  return { deleted: result.count };
}

export async function retryDlqMessage(messageId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new NotFoundError("Message");
  }

  if (message.status !== "dlq") {
    throw new ConflictError("Message", "Message must be in DLQ to retry");
  }

  return prisma.message.update({
    where: { id: messageId },
    data: { 
      status: "pending",
      retries: 0,
    },
  });
}

export async function retryAllDlqMessages() {
  const result = await prisma.message.updateMany({
    where: { status: "dlq" },
    data: { 
      status: "pending",
      retries: 0,
    },
  });

  return { retried: result.count };
}
