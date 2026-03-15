import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { Agent, Prisma } from "@amb-app/db";

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(projectId: string): Promise<Agent[]> {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      return tx.agent.findMany({
        where: { projectId: context.projectId },
        orderBy: { createdAt: "desc" },
      });
    });
  }

  async create(
    projectId: string,
    data: { name: string; role: string; capabilities?: unknown }
  ): Promise<Agent> {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      return tx.agent.create({
        data: {
          tenantId: context.tenantId,
          projectId: context.projectId,
          name: data.name,
          role: data.role,
          capabilities: (data.capabilities ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
    });
  }

  async search(projectId: string, query: string): Promise<Agent[]> {
    if (!query) return this.list(projectId);
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      return tx.agent.findMany({
        where: {
          projectId: context.projectId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { role: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { name: "asc" },
      });
    });
  }
}
