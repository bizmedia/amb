import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { updateThreadSchema } from "@amb-app/shared";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;
    const { id } = await params;
    const client = getApiClient({ projectId: project.projectId, token });
    const thread = await client.getThread(id);
    return NextResponse.json({ data: thread });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return jsonError(400, "invalid_json", "Request body must be valid JSON");
    const result = updateThreadSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }
    const client = getApiClient({ projectId: project.projectId, token });
    const thread = await client.updateThread(id, { status: result.data.status });
    return NextResponse.json({ data: thread });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;
    const { id } = await params;
    const client = getApiClient({ projectId: project.projectId, token });
    await client.deleteThread(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
