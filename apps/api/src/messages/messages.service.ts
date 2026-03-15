import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConflictError, NotFoundError } from "@amb-app/shared";
import type { Message, Prisma } from "@amb-app/db";

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureThread(projectId: string, threadId: string) {
    const t = await this.prisma.thread.findFirst({
      where: { id: threadId, projectId },
    });
    if (!t) throw new NotFoundError("Thread");
  }

  private async ensureAgent(projectId: string, agentId: string, label: string) {
    const a = await this.prisma.agent.findFirst({
      where: { id: agentId, projectId },
    });
    if (!a) throw new NotFoundError(label);
  }

  async send(projectId: string, data: {
    threadId: string;
    fromAgentId: string;
    toAgentId?: string | null;
    payload: unknown;
    parentId?: string | null;
  }): Promise<Message> {
    await this.ensureThread(projectId, data.threadId);
    await this.ensureAgent(projectId, data.fromAgentId, "From agent");
    if (data.toAgentId) await this.ensureAgent(projectId, data.toAgentId, "To agent");
    if (data.parentId) {
      const p = await this.prisma.message.findFirst({
        where: { id: data.parentId, projectId },
      });
      if (!p) throw new NotFoundError("Parent message");
    }
    return this.prisma.message.create({
      data: {
        projectId,
        threadId: data.threadId,
        fromAgentId: data.fromAgentId,
        toAgentId: data.toAgentId ?? null,
        payload: data.payload as Prisma.InputJsonValue,
        parentId: data.parentId ?? null,
        status: "pending",
        retries: 0,
      },
    });
  }

  async getInbox(projectId: string, agentId: string): Promise<Message[]> {
    return this.prisma.$transaction(async (tx) => {
      await tx.message.updateMany({
        where: {
          projectId,
          OR: [{ toAgentId: agentId }, { toAgentId: null }],
          fromAgentId: { not: agentId },
          status: "pending",
        },
        data: { status: "delivered" },
      });
      return tx.message.findMany({
        where: {
          projectId,
          OR: [{ toAgentId: agentId }, { toAgentId: null }],
          fromAgentId: { not: agentId },
          status: "delivered",
        },
        orderBy: { createdAt: "asc" },
      });
    });
  }

  async ack(projectId: string, messageId: string): Promise<Message> {
    const msg = await this.prisma.message.findFirst({
      where: { id: messageId, projectId },
    });
    if (!msg) throw new NotFoundError("Message");
    if (msg.status === "ack") return msg;
    if (msg.status !== "delivered") {
      throw new ConflictError("Message", "Message must be delivered before ack");
    }
    return this.prisma.message.update({
      where: { id: messageId },
      data: { status: "ack" },
    });
  }
}
