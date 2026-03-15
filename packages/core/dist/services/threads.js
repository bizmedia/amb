import { NotFoundError } from "@amb-app/shared";
export async function listThreads(storage, projectId) {
    return storage.listThreads(projectId);
}
export function createThread(storage, input) {
    return storage.createThread(input);
}
export async function getThreadById(storage, projectId, threadId) {
    const thread = await storage.getThreadById(projectId, threadId);
    if (!thread)
        throw new NotFoundError("Thread");
    return thread;
}
export async function listThreadMessages(storage, projectId, threadId) {
    await getThreadById(storage, projectId, threadId);
    return storage.listThreadMessages(projectId, threadId);
}
export async function updateThreadStatus(storage, projectId, threadId, status) {
    await getThreadById(storage, projectId, threadId);
    return storage.updateThreadStatus(projectId, threadId, status);
}
export async function deleteThread(storage, projectId, threadId) {
    await getThreadById(storage, projectId, threadId);
    return storage.deleteThread(projectId, threadId);
}
