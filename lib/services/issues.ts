import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/services/errors";
import { IssuePriority, IssueState } from "../../prisma/generated/client";

export type IssueFilters = {
  state?: IssueState;
  priority?: IssuePriority;
  assigneeId?: string;
  dueFrom?: Date;
  dueTo?: Date;
};

export type CreateIssueInput = {
  projectId: string;
  title: string;
  description?: string | null;
  state?: IssueState;
  priority?: IssuePriority;
  assigneeId?: string | null;
  dueDate?: Date | null;
};

export type UpdateIssueInput = {
  title?: string;
  description?: string | null;
  state?: IssueState;
  priority?: IssuePriority;
  assigneeId?: string | null;
  dueDate?: Date | null;
};

async function ensureProjectAssignee(projectId: string, assigneeId: string | null | undefined) {
  if (!assigneeId) {
    return;
  }

  const assignee = await prisma.agent.findFirst({
    where: {
      id: assigneeId,
      projectId,
    },
    select: { id: true },
  });

  if (!assignee) {
    throw new NotFoundError("Assignee", "Assignee must be a project member");
  }
}

function buildDateFilter(dueFrom?: Date, dueTo?: Date) {
  if (!dueFrom && !dueTo) {
    return undefined;
  }

  return {
    ...(dueFrom ? { gte: dueFrom } : {}),
    ...(dueTo ? { lte: dueTo } : {}),
  };
}

export async function listIssues(projectId: string, filters: IssueFilters = {}) {
  return prisma.issue.findMany({
    where: {
      projectId,
      ...(filters.state ? { state: filters.state } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      ...(filters.dueFrom || filters.dueTo
        ? {
            dueDate: buildDateFilter(filters.dueFrom, filters.dueTo),
          }
        : {}),
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function createIssue(input: CreateIssueInput) {
  await ensureProjectAssignee(input.projectId, input.assigneeId);

  return prisma.issue.create({
    data: {
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? null,
      state: input.state ?? IssueState.BACKLOG,
      priority: input.priority ?? IssuePriority.NONE,
      assigneeId: input.assigneeId ?? null,
      dueDate: input.dueDate ?? null,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}

export async function getIssueById(projectId: string, issueId: string) {
  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      projectId,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!issue) {
    throw new NotFoundError("Issue");
  }

  return issue;
}

export async function updateIssue(projectId: string, issueId: string, input: UpdateIssueInput) {
  await getIssueById(projectId, issueId);

  if (Object.prototype.hasOwnProperty.call(input, "assigneeId")) {
    await ensureProjectAssignee(projectId, input.assigneeId);
  }

  return prisma.issue.update({
    where: { id: issueId },
    data: {
      ...(Object.prototype.hasOwnProperty.call(input, "title") ? { title: input.title } : {}),
      ...(Object.prototype.hasOwnProperty.call(input, "description")
        ? { description: input.description ?? null }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(input, "state") ? { state: input.state } : {}),
      ...(Object.prototype.hasOwnProperty.call(input, "priority")
        ? { priority: input.priority }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(input, "assigneeId")
        ? { assigneeId: input.assigneeId ?? null }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(input, "dueDate")
        ? { dueDate: input.dueDate ?? null }
        : {}),
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}

export async function deleteIssue(projectId: string, issueId: string) {
  await getIssueById(projectId, issueId);
  return prisma.issue.delete({
    where: { id: issueId },
  });
}

export async function listProjectMembers(projectId: string) {
  return prisma.agent.findMany({
    where: { projectId },
    select: {
      id: true,
      name: true,
      role: true,
      status: true,
    },
    orderBy: [{ name: "asc" }],
  });
}
