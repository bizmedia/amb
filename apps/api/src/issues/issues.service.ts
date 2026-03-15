import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundError } from "@amb-app/shared";
import type { IssuePriority, IssueState } from "@amb-app/db";

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureAssignee(projectId: string, assigneeId: string | null | undefined) {
    if (!assigneeId) return;
    const a = await this.prisma.agent.findFirst({
      where: { id: assigneeId, projectId },
      select: { id: true },
    });
    if (!a) throw new NotFoundError("Assignee", "Assignee must be a project member");
  }

  async list(
    projectId: string,
    filters: {
      state?: IssueState;
      priority?: IssuePriority;
      assigneeId?: string;
      dueFrom?: Date;
      dueTo?: Date;
    } = {}
  ) {
    return this.prisma.issue.findMany({
      where: {
        projectId,
        ...(filters.state ? { state: filters.state } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
        ...(filters.dueFrom || filters.dueTo
          ? {
              dueDate: {
                ...(filters.dueFrom ? { gte: filters.dueFrom } : {}),
                ...(filters.dueTo ? { lte: filters.dueTo } : {}),
              },
            }
          : {}),
      },
      include: {
        assignee: { select: { id: true, name: true, role: true } },
      },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async create(
    projectId: string,
    data: {
      title: string;
      description?: string | null;
      state?: IssueState;
      priority?: IssuePriority;
      assigneeId?: string | null;
      dueDate?: Date | null;
    }
  ) {
    await this.ensureAssignee(projectId, data.assigneeId);
    return this.prisma.issue.create({
      data: {
        projectId,
        title: data.title,
        description: data.description ?? null,
        state: data.state ?? "BACKLOG",
        priority: data.priority ?? "NONE",
        assigneeId: data.assigneeId ?? null,
        dueDate: data.dueDate ?? null,
      },
      include: {
        assignee: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async getById(projectId: string, issueId: string) {
    const issue = await this.prisma.issue.findFirst({
      where: { id: issueId, projectId },
      include: {
        assignee: { select: { id: true, name: true, role: true } },
      },
    });
    if (!issue) throw new NotFoundError("Issue");
    return issue;
  }

  async update(
    projectId: string,
    issueId: string,
    data: {
      title?: string;
      description?: string | null;
      state?: IssueState;
      priority?: IssuePriority;
      assigneeId?: string | null;
      dueDate?: Date | null;
    }
  ) {
    await this.getById(projectId, issueId);
    if (Object.prototype.hasOwnProperty.call(data, "assigneeId")) {
      await this.ensureAssignee(projectId, data.assigneeId);
    }
    const update: Record<string, unknown> = {};
    if (Object.prototype.hasOwnProperty.call(data, "title")) update.title = data.title;
    if (Object.prototype.hasOwnProperty.call(data, "description")) update.description = data.description ?? null;
    if (Object.prototype.hasOwnProperty.call(data, "state")) update.state = data.state;
    if (Object.prototype.hasOwnProperty.call(data, "priority")) update.priority = data.priority;
    if (Object.prototype.hasOwnProperty.call(data, "assigneeId")) update.assigneeId = data.assigneeId ?? null;
    if (Object.prototype.hasOwnProperty.call(data, "dueDate")) update.dueDate = data.dueDate ?? null;

    return this.prisma.issue.update({
      where: { id: issueId },
      data: {
        ...(Object.prototype.hasOwnProperty.call(data, "title") ? { title: data.title! } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, "description") ? { description: data.description ?? null } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, "state") ? { state: data.state } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, "priority") ? { priority: data.priority } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, "assigneeId") ? { assigneeId: data.assigneeId ?? null } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, "dueDate") ? { dueDate: data.dueDate ?? null } : {}),
      },
      include: {
        assignee: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async delete(projectId: string, issueId: string) {
    await this.getById(projectId, issueId);
    return this.prisma.issue.delete({
      where: { id: issueId },
    });
  }
}
