import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundError } from "@amb-app/shared";
import type { Message, Thread } from "@amb-app/db";

export type ThreadWithMessages = Thread & { messages: Message[] };

@Injectable()
export class ThreadsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(projectId: string): Promise<ThreadWithMessages[]> {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      return tx.thread.findMany({
        where: { projectId: context.projectId },
        include: {
          messages: { orderBy: { createdAt: "asc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });
    });
  }

  async create(
    projectId: string,
    data: { title: string; status?: "open" | "closed" }
  ): Promise<Thread> {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      return tx.thread.create({
        data: {
          tenantId: context.tenantId,
          projectId: context.projectId,
          title: data.title,
          status: data.status ?? "open",
        },
      });
    });
  }

  async getById(projectId: string, threadId: string): Promise<Thread> {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const thread = await tx.thread.findFirst({
        where: { id: threadId, projectId: context.projectId },
      });
      if (!thread) throw new NotFoundError("Thread");
      return thread;
    });
  }

  async listMessages(
    projectId: string,
    threadId: string
  ): Promise<Message[]> {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const thread = await tx.thread.findFirst({
        where: { id: threadId, projectId: context.projectId },
        select: { id: true },
      });
      if (!thread) throw new NotFoundError("Thread");

      return tx.message.findMany({
        where: { threadId, projectId: context.projectId },
        orderBy: { createdAt: "asc" },
      });
    });
  }

  async updateStatus(
    projectId: string,
    threadId: string,
    status: "open" | "closed" | "archived"
  ): Promise<Thread> {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const thread = await tx.thread.findFirst({
        where: { id: threadId, projectId: context.projectId },
        select: { id: true },
      });
      if (!thread) throw new NotFoundError("Thread");

      return tx.thread.update({
        where: { id: threadId },
        data: { status },
      });
    });
  }

  async delete(projectId: string, threadId: string): Promise<void> {
    await this.prisma.withProjectContext(projectId, async (tx, context) => {
      const thread = await tx.thread.findFirst({
        where: { id: threadId, projectId: context.projectId },
        select: { id: true },
      });
      if (!thread) throw new NotFoundError("Thread");

      await tx.message.deleteMany({
        where: { threadId, projectId: context.projectId },
      });
      await tx.thread.delete({
        where: { id: threadId },
      });
    });
  }
}
