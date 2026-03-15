import { ConflictError, NotFoundError } from "@amb-app/shared";
import type { MessageBusStorage } from "../storage/interface";

const MAX_RETRIES = 3;
const DELIVERY_TIMEOUT_MS = 60_000;

export type SendMessageInput = {
  projectId: string;
  threadId: string;
  fromAgentId: string;
  toAgentId?: string | null;
  payload: unknown;
  parentId?: string | null;
};

export async function sendMessage(storage: MessageBusStorage, input: SendMessageInput) {
  const thread = await storage.getThreadById(input.projectId, input.threadId);
  if (!thread) throw new NotFoundError("Thread");

  const fromAgent = await storage.getAgentById(input.projectId, input.fromAgentId);
  if (!fromAgent) throw new NotFoundError("From agent");

  if (input.toAgentId) {
    const toAgent = await storage.getAgentById(input.projectId, input.toAgentId);
    if (!toAgent) throw new NotFoundError("To agent");
  }

  if (input.parentId) {
    const parent = await storage.getMessageById(input.projectId, input.parentId);
    if (!parent) throw new NotFoundError("Parent message");
  }

  return storage.createMessage({
    projectId: input.projectId,
    threadId: input.threadId,
    fromAgentId: input.fromAgentId,
    toAgentId: input.toAgentId ?? null,
    payload: input.payload,
    parentId: input.parentId ?? null,
    status: "pending",
    retries: 0,
  });
}

export function getInboxMessages(storage: MessageBusStorage, projectId: string, agentId: string) {
  return storage.getInboxAndMarkDelivered(projectId, agentId);
}

export async function ackMessage(
  storage: MessageBusStorage,
  projectId: string,
  messageId: string
) {
  const message = await storage.getMessageById(projectId, messageId);
  if (!message) throw new NotFoundError("Message");
  if (message.status === "ack") return message;
  if (message.status !== "delivered") {
    throw new ConflictError("Message", "Message must be delivered before ack");
  }
  return storage.updateMessageStatus(projectId, messageId, "ack");
}

export async function retryTimedOutMessages(storage: MessageBusStorage, projectId: string) {
  const threshold = new Date(Date.now() - DELIVERY_TIMEOUT_MS);
  const timedOut = await storage.findMessages(projectId, {
    status: "delivered",
    createdAtLt: threshold,
  });
  let retried = 0;
  let movedToDlq = 0;
  for (const message of timedOut) {
    const newRetries = message.retries + 1;
    if (newRetries >= MAX_RETRIES) {
      await storage.updateMessageStatus(projectId, message.id, "dlq", newRetries);
      movedToDlq++;
    } else {
      await storage.updateMessageStatus(projectId, message.id, "pending", newRetries);
      retried++;
    }
  }
  return { retried, movedToDlq };
}

export function getDlqMessages(storage: MessageBusStorage, projectId: string) {
  return storage.findMessages(projectId, { status: "dlq" });
}

export async function cleanupOldMessages(
  storage: MessageBusStorage,
  projectId: string,
  retentionDays: number = 30
) {
  const threshold = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const deleted = await storage.deleteManyMessages(projectId, {
    status: { in: ["ack", "dlq"] },
    createdAtLt: threshold,
  });
  return { deleted };
}

export async function retryDlqMessage(
  storage: MessageBusStorage,
  projectId: string,
  messageId: string
) {
  const message = await storage.getMessageById(projectId, messageId);
  if (!message) throw new NotFoundError("Message");
  if (message.status !== "dlq") {
    throw new ConflictError("Message", "Message must be in DLQ to retry");
  }
  return storage.updateMessageStatus(projectId, messageId, "pending", 0);
}

export async function retryAllDlqMessages(storage: MessageBusStorage, projectId: string) {
  const retried = await storage.updateManyMessagesToStatus(
    projectId,
    { status: "dlq" },
    { status: "pending", retries: 0 }
  );
  return { retried };
}
