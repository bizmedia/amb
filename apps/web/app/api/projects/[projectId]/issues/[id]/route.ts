import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectIdParam } from "@/lib/api/project-params";
import { getApiClient } from "@/lib/api/client";
import { updateIssueSchema } from "@amb-app/shared";

type RouteParams = { params: Promise<{ projectId: string; id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { projectId: rawProjectId, id } = await params;
    const project = await resolveProjectIdParam(rawProjectId);
    if (project.error) return project.error;
    const client = getApiClient(project.projectId);
    const issue = await client.getIssue(project.projectId, id);
    return NextResponse.json({ data: issue });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { projectId: rawProjectId, id } = await params;
    const project = await resolveProjectIdParam(rawProjectId);
    if (project.error) return project.error;
    const body = await request.json().catch(() => null);
    if (!body) return jsonError(400, "invalid_json", "Request body must be valid JSON");
    const result = updateIssueSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }
    const update: { title?: string; description?: string | null; state?: string; priority?: string; assigneeId?: string | null; dueDate?: Date | string | null } = {};
    if (result.data.title !== undefined) update.title = result.data.title;
    if (Object.prototype.hasOwnProperty.call(result.data, "description")) update.description = result.data.description ?? null;
    if (result.data.state !== undefined) update.state = result.data.state;
    if (result.data.priority !== undefined) update.priority = result.data.priority;
    if (Object.prototype.hasOwnProperty.call(result.data, "assigneeId")) update.assigneeId = result.data.assigneeId ?? null;
    if (Object.prototype.hasOwnProperty.call(result.data, "dueDate")) update.dueDate = result.data.dueDate ?? null;

    const client = getApiClient(project.projectId);
    const issue = await client.updateIssue(project.projectId, id, update);
    return NextResponse.json({ data: issue });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { projectId: rawProjectId, id } = await params;
    const project = await resolveProjectIdParam(rawProjectId);
    if (project.error) return project.error;
    const client = getApiClient(project.projectId);
    await client.deleteIssue(project.projectId, id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
