import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConflictError, NotFoundError } from "@amb-app/shared";
import type { Message, Prisma } from "@amb-app/db";

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureThread(tx: Prisma.TransactionClient, projectId: string, threadId: string) {
    const t = await tx.thread.findFirst({
      where: { id: threadId, projectId },
    });
    if (!t) throw new NotFoundError("Thread");
  }

  private async ensureAgent(
    tx: Prisma.TransactionClient,
    projectId: string,
    agentId: string,
    label: string
  ) {
    const a = await tx.agent.findFirst({
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
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      await this.ensureThread(tx, context.projectId, data.threadId);
      await this.ensureAgent(tx, context.projectId, data.fromAgentId, "From agent");
      if (data.toAgentId) {
        await this.ensureAgent(tx, context.projectId, data.toAgentId, "To agent");
      }
      if (data.parentId) {
        const p = await tx.message.findFirst({
          where: { id: data.parentId, projectId: context.projectId },
        });
        if (!p) throw new NotFoundError("Parent message");
      }
      return tx.message.create({
        data: {
          tenantId: context.tenantId,
          projectId: context.projectId,
          threadId: data.threadId,
          fromAgentId: data.fromAgentId,
          toAgentId: data.toAgentId ?? null,
          payload: data.payload as Prisma.InputJsonValue,
          parentId: data.parentId ?? null,
          status: "pending",
          retries: 0,
        },
      });
    });
  }

  async getInbox(projectId: string, agentId: string): Promise<Message[]> {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      await tx.message.updateMany({
        where: {
          projectId: context.projectId,
          OR: [{ toAgentId: agentId }, { toAgentId: null }],
          fromAgentId: { not: agentId },
          status: "pending",
        },
        data: { status: "delivered" },
      });
      return tx.message.findMany({
        where: {
          projectId: context.projectId,
          OR: [{ toAgentId: agentId }, { toAgentId: null }],
          fromAgentId: { not: agentId },
          status: "delivered",
        },
        orderBy: { createdAt: "asc" },
      });
    });
  }

  async ack(projectId: string, messageId: string): Promise<Message> {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const msg = await tx.message.findFirst({
        where: { id: messageId, projectId: context.projectId },
      });
      if (!msg) throw new NotFoundError("Message");
      if (msg.status === "ack") return msg;
      if (msg.status !== "delivered") {
        throw new ConflictError("Message", "Message must be delivered before ack");
      }
      return tx.message.update({
        where: { id: messageId },
        data: { status: "ack" },
      });
    });
  }
}
