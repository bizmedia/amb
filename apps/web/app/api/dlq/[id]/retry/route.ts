import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;
    const { id } = await params;
    const client = getApiClient({ projectId: project.projectId, token });
    const message = await client.retryDLQMessage(id);
    return NextResponse.json({ data: message });
  } catch (error) {
    return handleApiError(error);
  }
}
