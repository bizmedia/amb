import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConflictError, NotFoundError } from "@amb-app/shared";
import type { Prisma, SprintStatus } from "@amb-app/db";

const taskListSelect = {
  id: true,
  key: true,
  title: true,
  state: true,
  priority: true,
  assignee: { select: { id: true, name: true, role: true } },
  epic: { select: { id: true, title: true, status: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskSelect;

@Injectable()
export class SprintsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureAtMostOneActiveSprint(
    tx: Prisma.TransactionClient,
    projectId: string,
    exceptSprintId?: string
  ) {
    const existing = await tx.sprint.findFirst({
      where: {
        projectId,
        status: "ACTIVE",
        ...(exceptSprintId ? { id: { not: exceptSprintId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictError("Sprint", "Project already has an active sprint");
    }
  }

  async create(
    projectId: string,
    data: {
      name: string;
      goal?: string | null;
      startDate?: Date | null;
      endDate?: Date | null;
    }
  ) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      return tx.sprint.create({
        data: {
          projectId: context.projectId,
          name: data.name,
          goal: data.goal ?? null,
          startDate: data.startDate ?? null,
          endDate: data.endDate ?? null,
        },
      });
    });
  }

  async list(projectId: string, filters: { status?: SprintStatus } = {}) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const where: Prisma.SprintWhereInput = {
        projectId: context.projectId,
        ...(filters.status !== undefined ? { status: filters.status } : {}),
      };

      return tx.sprint.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        include: {
          _count: { select: { tasks: true } },
        },
      });
    });
  }

  async getById(projectId: string, sprintId: string) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const sprint = await tx.sprint.findFirst({
        where: { id: sprintId, projectId: context.projectId },
        include: {
          _count: { select: { tasks: true } },
          tasks: {
            select: taskListSelect,
            orderBy: [{ createdAt: "desc" }],
          },
        },
      });
      if (!sprint) throw new NotFoundError("Sprint");
      return sprint;
    });
  }

  async update(
    projectId: string,
    sprintId: string,
    data: {
      name?: string;
      goal?: string | null;
      startDate?: Date | null;
      endDate?: Date | null;
      status?: SprintStatus;
    }
  ) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const current = await tx.sprint.findFirst({
        where: { id: sprintId, projectId: context.projectId },
        select: { id: true, status: true },
      });
      if (!current) throw new NotFoundError("Sprint");

      if (
        Object.prototype.hasOwnProperty.call(data, "status") &&
        data.status === "ACTIVE" &&
        current.status !== "ACTIVE"
      ) {
        await this.ensureAtMostOneActiveSprint(tx, context.projectId, sprintId);
      }

      return tx.sprint.update({
        where: { id: sprintId },
        data: {
          ...(Object.prototype.hasOwnProperty.call(data, "name") ? { name: data.name! } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "goal") ? { goal: data.goal ?? null } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "startDate")
            ? { startDate: data.startDate ?? null }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "endDate")
            ? { endDate: data.endDate ?? null }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "status") ? { status: data.status } : {}),
        },
      });
    });
  }

  async start(projectId: string, sprintId: string) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const current = await tx.sprint.findFirst({
        where: { id: sprintId, projectId: context.projectId },
        select: { id: true, status: true },
      });
      if (!current) throw new NotFoundError("Sprint");
      if (current.status !== "PLANNED") {
        throw new ConflictError("Sprint", "Only planned sprints can be started");
      }
      await this.ensureAtMostOneActiveSprint(tx, context.projectId, sprintId);
      return tx.sprint.update({
        where: { id: sprintId },
        data: { status: "ACTIVE" },
      });
    });
  }

  async complete(projectId: string, sprintId: string) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const current = await tx.sprint.findFirst({
        where: { id: sprintId, projectId: context.projectId },
        select: { id: true, status: true },
      });
      if (!current) throw new NotFoundError("Sprint");
      if (current.status === "COMPLETED") {
        throw new ConflictError("Sprint", "Sprint is already completed");
      }
      return tx.sprint.update({
        where: { id: sprintId },
        data: { status: "COMPLETED" },
      });
    });
  }

  async deletePlanned(projectId: string, sprintId: string) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const current = await tx.sprint.findFirst({
        where: { id: sprintId, projectId: context.projectId },
        select: { id: true, status: true },
      });
      if (!current) throw new NotFoundError("Sprint");
      if (current.status !== "PLANNED") {
        throw new ConflictError("Sprint", "Only planned sprints can be deleted");
      }
      await tx.sprint.delete({
        where: { id: sprintId },
      });
    });
  }
}
