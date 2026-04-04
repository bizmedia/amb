import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { createProjectSchema } from "@amb-app/shared";

export async function GET(request: Request) {
  try {
    const token = getRequestAuthToken(request);
    if (!token) {
      return NextResponse.json({ data: [] });
    }
    const client = getApiClient({ token });
    const projects = await client.listProjects();
    return NextResponse.json({ data: projects });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const token = getRequestAuthToken(request);
    const body = await request.json().catch(() => null);
    if (!body) return jsonError(400, "invalid_json", "Request body must be valid JSON");
    const result = createProjectSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }
    const client = getApiClient({ token });
    const project = await client.createProject({
      name: result.data.name,
      ...(result.data.taskPrefix ? { taskPrefix: result.data.taskPrefix } : {}),
    });
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
