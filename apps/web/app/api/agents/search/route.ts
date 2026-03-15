import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const project = await resolveProjectId(request);
    if (project.error) return project.error;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const client = getApiClient(project.projectId);
    const agents = await client.searchAgents(query);
    return NextResponse.json({ data: agents });
  } catch (error) {
    return handleApiError(error);
  }
}
