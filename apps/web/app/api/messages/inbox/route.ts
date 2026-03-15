import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { inboxQuerySchema } from "@amb-app/shared";

export async function GET(request: Request) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;
    const agentId = new URL(request.url).searchParams.get("agentId");
    const parsed = inboxQuerySchema.safeParse({ agentId });
    if (!parsed.success) {
      return jsonError(400, "invalid_params", "Invalid agentId", parsed.error.flatten());
    }
    const client = getApiClient({ projectId: project.projectId, token });
    const messages = await client.getInbox(parsed.data.agentId);
    return NextResponse.json({ data: messages });
  } catch (error) {
    return handleApiError(error);
  }
}
