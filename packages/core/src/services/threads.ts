import { NotFoundError } from "@amb-app/shared";
import type { MessageBusStorage } from "../storage/interface";

export type CreateThreadInput = {
  projectId: string;
  title: string;
  status: "open" | "closed";
};

export async function listThreads(storage: MessageBusStorage, projectId: string) {
  return storage.listThreads(projectId);
}

export function createThread(storage: MessageBusStorage, input: CreateThreadInput) {
  return storage.createThread(input);
}

export async function getThreadById(
  storage: MessageBusStorage,
  projectId: string,
  threadId: string
) {
  const thread = await storage.getThreadById(projectId, threadId);
  if (!thread) throw new NotFoundError("Thread");
  return thread;
}

export async function listThreadMessages(
  storage: MessageBusStorage,
  projectId: string,
  threadId: string
) {
  await getThreadById(storage, projectId, threadId);
  return storage.listThreadMessages(projectId, threadId);
}

export async function updateThreadStatus(
  storage: MessageBusStorage,
  projectId: string,
  threadId: string,
  status: "open" | "closed" | "archived"
) {
  await getThreadById(storage, projectId, threadId);
  return storage.updateThreadStatus(projectId, threadId, status);
}

export async function deleteThread(
  storage: MessageBusStorage,
  projectId: string,
  threadId: string
) {
  await getThreadById(storage, projectId, threadId);
  return storage.deleteThread(projectId, threadId);
}
