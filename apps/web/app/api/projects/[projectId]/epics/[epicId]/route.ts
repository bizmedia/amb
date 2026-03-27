import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectIdParam } from "@/lib/api/project-params";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { updateEpicSchema, uuidSchema } from "@amb-app/shared";

type RouteParams = { params: Promise<{ projectId: string; epicId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId, epicId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const parsedEpic = uuidSchema.safeParse(epicId);
    if (!parsedEpic.success) {
      return jsonError(400, "invalid_params", "epicId must be a valid UUID");
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const data = await client.epics.get(project.projectId, parsedEpic.data);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId, epicId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const parsedEpic = uuidSchema.safeParse(epicId);
    if (!parsedEpic.success) {
      return jsonError(400, "invalid_params", "epicId must be a valid UUID");
    }

    const body = await request.json().catch(() => null);
    if (!body) return jsonError(400, "invalid_json", "Request body must be valid JSON");
    const result = updateEpicSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const epic = await client.epics.update(project.projectId, parsedEpic.data, result.data);
    return NextResponse.json({ data: epic });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId, epicId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const parsedEpic = uuidSchema.safeParse(epicId);
    if (!parsedEpic.success) {
      return jsonError(400, "invalid_params", "epicId must be a valid UUID");
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const epic = await client.epics.delete(project.projectId, parsedEpic.data);
    return NextResponse.json({ data: epic });
  } catch (error) {
    return handleApiError(error);
  }
}
