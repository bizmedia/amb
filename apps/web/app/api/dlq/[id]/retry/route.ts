import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const project = await resolveProjectId(request);
    if (project.error) return project.error;
    const { id } = await params;
    const client = getApiClient(project.projectId);
    const message = await client.retryDLQMessage(id);
    return NextResponse.json({ data: message });
  } catch (error) {
    return handleApiError(error);
  }
}
