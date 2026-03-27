import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectIdParam } from "@/lib/api/project-params";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { createEpicSchema, listEpicsQuerySchema } from "@amb-app/shared";

type RouteParams = { params: Promise<{ projectId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const url = new URL(request.url);
    const queryResult = listEpicsQuerySchema.safeParse({
      status: url.searchParams.get("status") ?? undefined,
    });
    if (!queryResult.success) {
      return jsonError(400, "invalid_request", "Invalid query params", queryResult.error.flatten());
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const data = await client.epics.list(project.projectId, {
      status: queryResult.data.status,
    });
    return NextResponse.json({ data });
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
    const result = createEpicSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const epic = await client.epics.create(project.projectId, {
      title: result.data.title,
      description: result.data.description ?? null,
      status: result.data.status,
    });
    return NextResponse.json({ data: epic }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
