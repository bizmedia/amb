import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectIdParam } from "@/lib/api/project-params";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { uuidSchema } from "@amb-app/shared";

type RouteParams = { params: Promise<{ projectId: string; sprintId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
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
    const sprint = await client.sprints.complete(project.projectId, parsed.data);
    return NextResponse.json({ data: sprint });
  } catch (error) {
    return handleApiError(error);
  }
}
