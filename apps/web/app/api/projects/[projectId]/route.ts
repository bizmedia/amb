import { NextResponse } from "next/server";
import { projectIdSchema, updateProjectSchema } from "@amb-app/shared";

import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { jsonError, handleApiError } from "@/lib/api/errors";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId } = await context.params;
    const parsedId = projectIdSchema.safeParse(projectId);
    if (!parsedId.success) {
      return jsonError(400, "invalid_project_id", "projectId must be a valid UUID");
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonError(400, "invalid_json", "Request body must be valid JSON");
    }

    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "invalid_request", "Invalid request body", parsed.error.flatten());
    }

    const client = getApiClient({ token });
    const project = await client.updateProject(parsedId.data, { name: parsed.data.name });
    return NextResponse.json({ data: project });
  } catch (error) {
    return handleApiError(error);
  }
}
