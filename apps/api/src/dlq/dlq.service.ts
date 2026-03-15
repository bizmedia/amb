import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConflictError, NotFoundError } from "@amb-app/shared";
import type { Message } from "@amb-app/db";

@Injectable()
export class DlqService {
  constructor(private readonly prisma: PrismaService) {}

  async list(projectId: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { projectId, status: "dlq" },
      orderBy: { createdAt: "desc" },
    });
  }

  async retryOne(projectId: string, messageId: string): Promise<Message> {
    const msg = await this.prisma.message.findFirst({
      where: { id: messageId, projectId },
    });
    if (!msg) throw new NotFoundError("Message");
    if (msg.status !== "dlq") {
      throw new ConflictError("Message", "Message must be in DLQ to retry");
    }
    return this.prisma.message.update({
      where: { id: messageId },
      data: { status: "pending", retries: 0 },
    });
  }

  async retryAll(projectId: string): Promise<{ count: number }> {
    const result = await this.prisma.message.updateMany({
      where: { projectId, status: "dlq" },
      data: { status: "pending", retries: 0 },
    });
    return { count: result.count };
  }
}
