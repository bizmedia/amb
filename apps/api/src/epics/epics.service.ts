import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundError } from "@amb-app/shared";
import type { EpicStatus, Prisma } from "@amb-app/db";

const taskListSelect = {
  id: true,
  key: true,
  title: true,
  state: true,
  priority: true,
  assignee: { select: { id: true, name: true, role: true } },
  sprint: { select: { id: true, name: true, status: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskSelect;

@Injectable()
export class EpicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    projectId: string,
    data: {
      title: string;
      description?: string | null;
      status?: EpicStatus;
    }
  ) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      return tx.epic.create({
        data: {
          projectId: context.projectId,
          title: data.title,
          description: data.description ?? null,
          ...(data.status ? { status: data.status } : {}),
        },
      });
    });
  }

  async list(projectId: string, filters: { status?: EpicStatus } = {}) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const where: Prisma.EpicWhereInput = {
        projectId: context.projectId,
        ...(filters.status !== undefined
          ? { status: filters.status }
          : { status: { not: "ARCHIVED" } }),
      };

      return tx.epic.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        include: {
          _count: { select: { tasks: true } },
        },
      });
    });
  }

  async getById(projectId: string, epicId: string) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const epic = await tx.epic.findFirst({
        where: { id: epicId, projectId: context.projectId },
        include: {
          _count: { select: { tasks: true } },
          tasks: {
            select: taskListSelect,
            orderBy: [{ createdAt: "desc" }],
          },
        },
      });
      if (!epic) throw new NotFoundError("Epic");
      return epic;
    });
  }

  async update(
    projectId: string,
    epicId: string,
    data: {
      title?: string;
      description?: string | null;
      status?: EpicStatus;
    }
  ) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const current = await tx.epic.findFirst({
        where: { id: epicId, projectId: context.projectId },
        select: { id: true },
      });
      if (!current) throw new NotFoundError("Epic");

      return tx.epic.update({
        where: { id: epicId },
        data: {
          ...(Object.prototype.hasOwnProperty.call(data, "title") ? { title: data.title! } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "description")
            ? { description: data.description ?? null }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "status") ? { status: data.status } : {}),
        },
      });
    });
  }

  async archive(projectId: string, epicId: string) {
    return this.update(projectId, epicId, { status: "ARCHIVED" });
  }
}
