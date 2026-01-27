import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/services/errors";

export type CreateThreadInput = {
  title: string;
  status: "open" | "closed";
};

export async function listThreads() {
  return prisma.thread.findMany({
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createThread(input: CreateThreadInput) {
  return prisma.thread.create({
    data: {
      title: input.title,
      status: input.status,
    },
  });
}

export async function getThreadById(threadId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
  });

  if (!thread) {
    throw new NotFoundError("Thread");
  }

  return thread;
}

export async function listThreadMessages(threadId: string) {
  await getThreadById(threadId);

  return prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateThreadStatus(threadId: string, status: "open" | "closed" | "archived") {
  await getThreadById(threadId);

  return prisma.thread.update({
    where: { id: threadId },
    data: { status },
  });
}

export async function deleteThread(threadId: string) {
  await getThreadById(threadId);

  // Delete all messages in the thread first
  await prisma.message.deleteMany({
    where: { threadId },
  });

  return prisma.thread.delete({
    where: { id: threadId },
  });
}
