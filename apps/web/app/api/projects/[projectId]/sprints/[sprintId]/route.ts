import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectIdParam } from "@/lib/api/project-params";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { updateSprintSchema, uuidSchema } from "@amb-app/shared";

type RouteParams = { params: Promise<{ projectId: string; sprintId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId, sprintId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const parsed = uuidSchema.safeParse(sprintId);
    if (!parsed.success) {
      return jsonError(400, "invalid_params", "sprintId must be a valid UUID");
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const data = await client.sprints.get(project.projectId, parsed.data);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId, sprintId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const parsed = uuidSchema.safeParse(sprintId);
    if (!parsed.success) {
      return jsonError(400, "invalid_params", "sprintId must be a valid UUID");
    }

    const body = await request.json().catch(() => null);
    if (!body) return jsonError(400, "invalid_json", "Request body must be valid JSON");
    const result = updateSprintSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const sprint = await client.sprints.update(project.projectId, parsed.data, result.data);
    return NextResponse.json({ data: sprint });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId, sprintId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const parsed = uuidSchema.safeParse(sprintId);
    if (!parsed.success) {
      return jsonError(400, "invalid_params", "sprintId must be a valid UUID");
    }

    const client = getApiClient({ projectId: project.projectId, token });
    await client.sprints.delete(project.projectId, parsed.data);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
