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
