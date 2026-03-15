import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { sendMessageSchema } from "@amb-app/shared";

export async function POST(request: Request) {
  try {
    const project = await resolveProjectId(request);
    if (project.error) return project.error;
    const body = await request.json().catch(() => null);
    if (!body) return jsonError(400, "invalid_json", "Request body must be valid JSON");
    const result = sendMessageSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }
    const client = getApiClient(project.projectId);
    const message = await client.sendMessage({
      threadId: result.data.threadId,
      fromAgentId: result.data.fromAgentId,
      toAgentId: result.data.toAgentId ?? undefined,
      payload: result.data.payload,
      parentId: result.data.parentId ?? undefined,
    });
    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
