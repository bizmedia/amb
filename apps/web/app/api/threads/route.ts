import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { createThreadSchema } from "@amb-app/shared";

export async function GET(request: Request) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;

    const client = getApiClient({ projectId: project.projectId, token });
    const threads = await client.listThreads();
    return NextResponse.json({ data: threads });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;

    const body = await request.json().catch(() => null);
    if (!body) return jsonError(400, "invalid_json", "Request body must be valid JSON");

    const result = createThreadSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const thread = await client.createThread({
      title: result.data.title,
      status: result.data.status,
    });
    return NextResponse.json({ data: thread }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
