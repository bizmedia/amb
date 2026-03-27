import { ConflictError, NotFoundError } from "@amb-app/shared";
import type { MessageBusStorage } from "../storage/interface";

/** Max delivery retries before moving message to DLQ. */
const MAX_RETRIES = 3;
/** Message is considered timed out when delivered older than this threshold. */
const DELIVERY_TIMEOUT_MS = 60_000;

/** Input for sending a message via the messages service. */
export type SendMessageInput = {
  projectId: string;
  threadId: string;
  fromAgentId: string;
  toAgentId?: string | null;
  payload: unknown;
  parentId?: string | null;
};

/**
 * Validate message references and create a pending message.
 * Throws `NotFoundError` for missing thread/agents/parent message.
 */
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

/** Get inbox for agent and atomically mark pending messages as delivered. */
export function getInboxMessages(storage: MessageBusStorage, projectId: string, agentId: string) {
  return storage.getInboxAndMarkDelivered(projectId, agentId);
}

/**
 * Acknowledge delivered message.
 * Throws `NotFoundError` when message does not exist and `ConflictError` for invalid status transition.
 */
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

/**
 * Retry timed-out delivered messages.
 * Messages that reach max retries are moved to DLQ.
 */
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

/** Return all messages currently in DLQ for project scope. */
export function getDlqMessages(storage: MessageBusStorage, projectId: string) {
  return storage.findMessages(projectId, { status: "dlq" });
}

/** Delete old acknowledged or DLQ messages and return deleted count. */
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

/**
 * Retry a single DLQ message by moving it to pending state and resetting retries.
 * Throws `NotFoundError`/`ConflictError` on invalid state.
 */
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

/** Retry all DLQ messages in project scope and return affected count. */
export async function retryAllDlqMessages(storage: MessageBusStorage, projectId: string) {
  const retried = await storage.updateManyMessagesToStatus(
    projectId,
    { status: "dlq" },
    { status: "pending", retries: 0 }
  );
  return { retried };
}
