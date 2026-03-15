import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundError } from "@amb-app/shared";
import type { Message, Thread } from "@amb-app/db";

export type ThreadWithMessages = Thread & { messages: Message[] };

@Injectable()
export class ThreadsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(projectId: string): Promise<ThreadWithMessages[]> {
    return this.prisma.thread.findMany({
      where: { projectId },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(
    projectId: string,
    data: { title: string; status?: "open" | "closed" }
  ): Promise<Thread> {
    return this.prisma.thread.create({
      data: {
        projectId,
        title: data.title,
        status: data.status ?? "open",
      },
    });
  }

  async getById(projectId: string, threadId: string): Promise<Thread> {
    const thread = await this.prisma.thread.findFirst({
      where: { id: threadId, projectId },
    });
    if (!thread) throw new NotFoundError("Thread");
    return thread;
  }

  async listMessages(
    projectId: string,
    threadId: string
  ): Promise<Message[]> {
    await this.getById(projectId, threadId);
    return this.prisma.message.findMany({
      where: { threadId, projectId },
      orderBy: { createdAt: "asc" },
    });
  }

  async updateStatus(
    projectId: string,
    threadId: string,
    status: "open" | "closed" | "archived"
  ): Promise<Thread> {
    await this.getById(projectId, threadId);
    return this.prisma.thread.update({
      where: { id: threadId },
      data: { status },
    });
  }

  async delete(projectId: string, threadId: string): Promise<void> {
    await this.getById(projectId, threadId);
    await this.prisma.message.deleteMany({
      where: { threadId, projectId },
    });
    await this.prisma.thread.delete({
      where: { id: threadId },
    });
  }
}
