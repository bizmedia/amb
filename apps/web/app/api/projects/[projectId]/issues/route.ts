import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectIdParam } from "@/lib/api/project-params";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import {
  createIssueSchema,
  listIssuesQuerySchema,
} from "@amb-app/shared";

type RouteParams = { params: Promise<{ projectId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

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

    const client = getApiClient({ projectId: project.projectId, token });
    const issues = await client.listIssues(project.projectId, {
      state: queryResult.data.state,
      priority: queryResult.data.priority,
      assignee: queryResult.data.assignee,
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
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const body = await request.json().catch(() => null);
    if (!body) return jsonError(400, "invalid_json", "Request body must be valid JSON");
    const result = createIssueSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const issue = await client.createIssue(project.projectId, {
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
