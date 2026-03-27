import { NotFoundError } from "@amb-app/shared";
import type { MessageBusStorage } from "../storage/interface";

/** Input for creating a thread via the threads service. */
export type CreateThreadInput = {
  projectId: string;
  title: string;
  status: "open" | "closed";
};

/** List all threads for the project. */
export async function listThreads(storage: MessageBusStorage, projectId: string) {
  return storage.listThreads(projectId);
}

/** Create a thread in the project scope. */
export function createThread(storage: MessageBusStorage, input: CreateThreadInput) {
  return storage.createThread(input);
}

/**
 * Get thread by id.
 * Throws `NotFoundError` when thread does not exist in project scope.
 */
export async function getThreadById(
  storage: MessageBusStorage,
  projectId: string,
  threadId: string
) {
  const thread = await storage.getThreadById(projectId, threadId);
  if (!thread) throw new NotFoundError("Thread");
  return thread;
}

/** List messages for a thread after ensuring the thread exists. */
export async function listThreadMessages(
  storage: MessageBusStorage,
  projectId: string,
  threadId: string
) {
  await getThreadById(storage, projectId, threadId);
  return storage.listThreadMessages(projectId, threadId);
}

/** Update thread status after existence check. */
export async function updateThreadStatus(
  storage: MessageBusStorage,
  projectId: string,
  threadId: string,
  status: "open" | "closed" | "archived"
) {
  await getThreadById(storage, projectId, threadId);
  return storage.updateThreadStatus(projectId, threadId, status);
}

/** Delete thread after existence check. */
export async function deleteThread(
  storage: MessageBusStorage,
  projectId: string,
  threadId: string
) {
  await getThreadById(storage, projectId, threadId);
  return storage.deleteThread(projectId, threadId);
}
