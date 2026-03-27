import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectIdParam } from "@/lib/api/project-params";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import {
  createTaskSchema,
  listTasksQuerySchema,
} from "@amb-app/shared";

type RouteParams = { params: Promise<{ projectId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const url = new URL(request.url);
    const queryResult = listTasksQuerySchema.safeParse({
      state: url.searchParams.get("state") ?? undefined,
      priority: url.searchParams.get("priority") ?? undefined,
      assignee: url.searchParams.get("assignee") ?? undefined,
      epicId: url.searchParams.get("epicId") ?? undefined,
      sprintId: url.searchParams.get("sprintId") ?? undefined,
      key: url.searchParams.get("key") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      dueFrom: url.searchParams.get("dueFrom") ?? undefined,
      dueTo: url.searchParams.get("dueTo") ?? undefined,
    });
    if (!queryResult.success) {
      return jsonError(400, "invalid_request", "Invalid query params", queryResult.error.flatten());
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const tasks = await client.listTasks(project.projectId, {
      state: queryResult.data.state,
      priority: queryResult.data.priority,
      assignee: queryResult.data.assignee,
      epicId: queryResult.data.epicId,
      sprintId: queryResult.data.sprintId,
      key: queryResult.data.key,
      search: queryResult.data.search,
      dueFrom: queryResult.data.dueFrom,
      dueTo: queryResult.data.dueTo,
    });
    return NextResponse.json({ data: tasks });
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
    const result = createTaskSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const task = await client.createTask(project.projectId, {
      title: result.data.title,
      description: result.data.description ?? null,
      state: result.data.state,
      priority: result.data.priority,
      assigneeId: result.data.assigneeId ?? null,
      dueDate: result.data.dueDate ?? null,
    });
    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
