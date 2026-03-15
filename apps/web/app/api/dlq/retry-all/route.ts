import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";

export async function POST(request: Request) {
  try {
    const token = getRequestAuthToken(request);
    const project = await resolveProjectId(request, token);
    if (project.error) return project.error;
    const client = getApiClient({ projectId: project.projectId, token });
    const result = await client.retryAllDLQ();
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
