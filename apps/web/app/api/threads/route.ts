import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { createThreadSchema } from "@amb-app/shared";

export async function GET(request: Request) {
  try {
    const project = await resolveProjectId(request);
    if (project.error) return project.error;

    const client = getApiClient(project.projectId);
    const threads = await client.listThreads();
    return NextResponse.json({ data: threads });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const project = await resolveProjectId(request);
    if (project.error) return project.error;

    const body = await request.json().catch(() => null);
    if (!body) return jsonError(400, "invalid_json", "Request body must be valid JSON");

    const result = createThreadSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const client = getApiClient(project.projectId);
    const thread = await client.createThread({
      title: result.data.title,
      status: result.data.status,
    });
    return NextResponse.json({ data: thread }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
