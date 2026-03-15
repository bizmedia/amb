import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { messageIdParamsSchema } from "@amb-app/shared";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;
    const params = await context.params;
    const parsed = messageIdParamsSchema.safeParse(params);
    if (!parsed.success) {
      return jsonError(400, "invalid_params", "Invalid message id", parsed.error.flatten());
    }
    const client = getApiClient({ projectId: project.projectId, token });
    const message = await client.ackMessage(parsed.data.id);
    return NextResponse.json({ data: message });
  } catch (error) {
    return handleApiError(error);
  }
}
