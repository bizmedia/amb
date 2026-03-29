import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConflictError, NotFoundError } from "@amb-app/shared";
import type { TaskPriority, TaskState, Prisma } from "@amb-app/db";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureAssignee(
    tx: Prisma.TransactionClient,
    projectId: string,
    assigneeId: string | null | undefined
  ) {
    if (!assigneeId) return;
    const a = await tx.agent.findFirst({
      where: { id: assigneeId, projectId },
      select: { id: true },
    });
    if (!a) throw new NotFoundError("Assignee", "Assignee must be a project member");
  }

  async list(
    projectId: string,
    filters: {
      state?: TaskState;
      priority?: TaskPriority;
      assigneeId?: string;
      epicId?: string;
      sprintId?: string;
      dueFrom?: Date;
      dueTo?: Date;
      key?: string;
      search?: string;
    } = {}
  ) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const keyFilter =
        filters.key !== undefined
          ? { key: filters.key }
          : filters.search !== undefined && filters.search.trim() !== ""
            ? { key: { startsWith: filters.search.trim() } }
            : {};

      return tx.task.findMany({
        where: {
          projectId: context.projectId,
          ...(filters.state ? { state: filters.state } : {}),
          ...(filters.priority ? { priority: filters.priority } : {}),
          ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
          ...(filters.epicId ? { epicId: filters.epicId } : {}),
          ...(filters.sprintId ? { sprintId: filters.sprintId } : {}),
          ...(filters.dueFrom || filters.dueTo
            ? {
                dueDate: {
                  ...(filters.dueFrom ? { gte: filters.dueFrom } : {}),
                  ...(filters.dueTo ? { lte: filters.dueTo } : {}),
                },
              }
            : {}),
          ...keyFilter,
        },
        include: {
          assignee: { select: { id: true, name: true, role: true } },
          epic: { select: { id: true, title: true, status: true } },
          sprint: { select: { id: true, name: true, status: true } },
        },
        orderBy: [{ createdAt: "desc" }],
      });
    });
  }

  async create(
    projectId: string,
    data: {
      title: string;
      description?: string | null;
      state?: TaskState;
      priority?: TaskPriority;
      assigneeId?: string | null;
      epicId?: string | null;
      sprintId?: string | null;
      dueDate?: Date | null;
    }
  ) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      await this.ensureAssignee(tx, context.projectId, data.assigneeId);

      if (data.epicId) {
        const epic = await tx.epic.findFirst({
          where: { id: data.epicId, projectId: context.projectId },
          select: { id: true, status: true },
        });
        if (!epic) throw new NotFoundError("Epic");
        if (epic.status === "ARCHIVED") {
          throw new ConflictError("Epic", "Cannot assign task to archived epic");
        }
      }

      if (data.sprintId) {
        const sprint = await tx.sprint.findFirst({
          where: { id: data.sprintId, projectId: context.projectId },
          select: { id: true, status: true },
        });
        if (!sprint) throw new NotFoundError("Sprint");
        if (sprint.status === "COMPLETED") {
          throw new ConflictError("Sprint", "Cannot assign task to completed sprint");
        }
      }

      const rows = await tx.$queryRawUnsafe<
        { taskSequence: number; taskPrefix: string | null }[]
      >(
        `UPDATE "Project"
         SET "taskSequence" = "taskSequence" + 1
         WHERE "id" = $1
         RETURNING "taskSequence", "taskPrefix"`,
        context.projectId
      );

      const row = rows[0];
      if (!row?.taskPrefix) {
        throw new NotFoundError("Project", "Project has no task prefix");
      }

      const key = `${row.taskPrefix}-${String(row.taskSequence).padStart(4, "0")}`;

      return tx.task.create({
        data: {
          projectId: context.projectId,
          key,
          title: data.title,
          description: data.description ?? null,
          state: data.state ?? "BACKLOG",
          priority: data.priority ?? "NONE",
          assigneeId: data.assigneeId ?? null,
          epicId: data.epicId ?? null,
          sprintId: data.sprintId ?? null,
          dueDate: data.dueDate ?? null,
        },
        include: {
          assignee: { select: { id: true, name: true, role: true } },
          epic: { select: { id: true, title: true, status: true } },
          sprint: { select: { id: true, name: true, status: true } },
        },
      });
    });
  }

  async getById(projectId: string, taskId: string) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const task = await tx.task.findFirst({
        where: { id: taskId, projectId: context.projectId },
        include: {
          assignee: { select: { id: true, name: true, role: true } },
          epic: { select: { id: true, title: true, status: true } },
          sprint: { select: { id: true, name: true, status: true } },
        },
      });
      if (!task) throw new NotFoundError("Task");
      return task;
    });
  }

  async getByKey(projectId: string, key: string) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const task = await tx.task.findFirst({
        where: { key, projectId: context.projectId },
        include: {
          assignee: { select: { id: true, name: true, role: true } },
          epic: { select: { id: true, title: true, status: true } },
          sprint: { select: { id: true, name: true, status: true } },
        },
      });
      if (!task) throw new NotFoundError("Task");
      return task;
    });
  }

  async update(
    projectId: string,
    taskId: string,
    data: {
      title?: string;
      description?: string | null;
      state?: TaskState;
      priority?: TaskPriority;
      assigneeId?: string | null;
      epicId?: string | null;
      sprintId?: string | null;
      dueDate?: Date | null;
    }
  ) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const current = await tx.task.findFirst({
        where: { id: taskId, projectId: context.projectId },
        select: { id: true },
      });
      if (!current) throw new NotFoundError("Task");

      if (Object.prototype.hasOwnProperty.call(data, "assigneeId")) {
        await this.ensureAssignee(tx, context.projectId, data.assigneeId);
      }

      if (Object.prototype.hasOwnProperty.call(data, "epicId")) {
        const epicId = data.epicId;
        if (epicId !== null && epicId !== undefined) {
          const epic = await tx.epic.findFirst({
            where: { id: epicId, projectId: context.projectId },
            select: { id: true, status: true },
          });
          if (!epic) throw new NotFoundError("Epic");
          if (epic.status === "ARCHIVED") {
            throw new ConflictError("Epic", "Cannot assign task to archived epic");
          }
        }
      }

      if (Object.prototype.hasOwnProperty.call(data, "sprintId")) {
        const sprintId = data.sprintId;
        if (sprintId !== null && sprintId !== undefined) {
          const sprint = await tx.sprint.findFirst({
            where: { id: sprintId, projectId: context.projectId },
            select: { id: true, status: true },
          });
          if (!sprint) throw new NotFoundError("Sprint");
          if (sprint.status === "COMPLETED") {
            throw new ConflictError("Sprint", "Cannot assign task to completed sprint");
          }
        }
      }

      return tx.task.update({
        where: { id: taskId },
        data: {
          ...(Object.prototype.hasOwnProperty.call(data, "title") ? { title: data.title! } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "description") ? { description: data.description ?? null } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "state") ? { state: data.state } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "priority") ? { priority: data.priority } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "assigneeId") ? { assigneeId: data.assigneeId ?? null } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "epicId") ? { epicId: data.epicId ?? null } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "sprintId") ? { sprintId: data.sprintId ?? null } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "dueDate") ? { dueDate: data.dueDate ?? null } : {}),
        },
        include: {
          assignee: { select: { id: true, name: true, role: true } },
          epic: { select: { id: true, title: true, status: true } },
          sprint: { select: { id: true, name: true, status: true } },
        },
      });
    });
  }

  async delete(projectId: string, taskId: string) {
    return this.prisma.withProjectContext(projectId, async (tx, context) => {
      const current = await tx.task.findFirst({
        where: { id: taskId, projectId: context.projectId },
        select: { id: true },
      });
      if (!current) throw new NotFoundError("Task");

      return tx.task.delete({
        where: { id: taskId },
      });
    });
  }
}
