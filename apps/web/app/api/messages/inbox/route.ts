import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { inboxQuerySchema } from "@amb-app/shared";

export async function GET(request: Request) {
  try {
    const project = await resolveProjectId(request);
    if (project.error) return project.error;
    const agentId = new URL(request.url).searchParams.get("agentId");
    const parsed = inboxQuerySchema.safeParse({ agentId });
    if (!parsed.success) {
      return jsonError(400, "invalid_params", "Invalid agentId", parsed.error.flatten());
    }
    const client = getApiClient(project.projectId);
    const messages = await client.getInbox(parsed.data.agentId);
    return NextResponse.json({ data: messages });
  } catch (error) {
    return handleApiError(error);
  }
}
