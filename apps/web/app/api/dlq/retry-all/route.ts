import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";

export async function POST(request: Request) {
  try {
    const project = await resolveProjectId(request);
    if (project.error) return project.error;
    const client = getApiClient(project.projectId);
    const result = await client.retryAllDLQ();
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
