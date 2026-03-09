import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectIdParam } from "@/lib/api/project-params";
import { createIssue, listIssues } from "@/lib/services/issues";
import { IssuePriority, IssueState } from "../../../../../prisma/generated/client";

type RouteParams = {
  params: Promise<{ projectId: string }>;
};

const issueStateSchema = z.nativeEnum(IssueState);
const issuePrioritySchema = z.nativeEnum(IssuePriority);

const createIssueSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  state: issueStateSchema.optional(),
  priority: issuePrioritySchema.optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

const listIssuesQuerySchema = z.object({
  state: issueStateSchema.optional(),
  priority: issuePrioritySchema.optional(),
  assignee: z.string().uuid().optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
});

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { projectId: rawProjectId } = await params;
    const project = await resolveProjectIdParam(rawProjectId);
    if (project.error) {
      return project.error;
    }

    const url = new URL(request.url);
    const queryResult = listIssuesQuerySchema.safeParse({
      state: url.searchParams.get("state") ?? undefined,
      priority: url.searchParams.get("priority") ?? undefined,
      assignee: url.searchParams.get("assignee") ?? undefined,
      dueFrom: url.searchParams.get("dueFrom") ?? undefined,
      dueTo: url.searchParams.get("dueTo") ?? undefined,
    });

    if (!queryResult.success) {
      return jsonError(400, "invalid_request", "Invalid query params", queryResult.error.flatten());
    }

    const issues = await listIssues(project.projectId, {
      state: queryResult.data.state,
      priority: queryResult.data.priority,
      assigneeId: queryResult.data.assignee,
      dueFrom: queryResult.data.dueFrom,
      dueTo: queryResult.data.dueTo,
    });

    return NextResponse.json({ data: issues });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { projectId: rawProjectId } = await params;
    const project = await resolveProjectIdParam(rawProjectId);
    if (project.error) {
      return project.error;
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonError(400, "invalid_json", "Request body must be valid JSON");
    }

    const result = createIssueSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const issue = await createIssue({
      projectId: project.projectId,
      title: result.data.title,
      description: result.data.description ?? null,
      state: result.data.state,
      priority: result.data.priority,
      assigneeId: result.data.assigneeId ?? null,
      dueDate: result.data.dueDate ?? null,
    });

    return NextResponse.json({ data: issue }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
