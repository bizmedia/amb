import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { threadIdParamsSchema } from "@amb-app/shared";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;
    const params = await context.params;
    const parsed = threadIdParamsSchema.safeParse(params);
    if (!parsed.success) {
      return jsonError(400, "invalid_params", "Invalid thread id", parsed.error.flatten());
    }
    const client = getApiClient({ projectId: project.projectId, token });
    const messages = await client.getThreadMessages(parsed.data.id);
    return NextResponse.json({ data: messages });
  } catch (error) {
    return handleApiError(error);
  }
}
