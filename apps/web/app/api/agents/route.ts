import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { createAgentSchema } from "@amb-app/shared";

export async function GET(request: Request) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;
    const client = getApiClient({ projectId: project.projectId, token });
    const agents = await client.listAgents();
    return NextResponse.json({ data: agents });
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
    const result = createAgentSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }
    const client = getApiClient({ projectId: project.projectId, token });
    const agent = await client.registerAgent({
      name: result.data.name,
      role: result.data.role,
      capabilities: result.data.capabilities,
    });
    return NextResponse.json({ data: agent }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
