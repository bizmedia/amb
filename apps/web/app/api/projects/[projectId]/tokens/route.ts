import { NextResponse } from "next/server";
import { adminIssueProjectTokenSchema } from "@amb-app/shared";

import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectIdParam } from "@/lib/api/project-params";

type RouteParams = { params: Promise<{ projectId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const client = getApiClient({ projectId: project.projectId, token });
    const tokens = await client.listProjectTokens(project.projectId);
    return NextResponse.json({ data: tokens });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonError(400, "invalid_json", "Request body must be valid JSON");
    }

    const parsed = adminIssueProjectTokenSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "invalid_request", "Invalid request body", parsed.error.flatten());
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const created = await client.createProjectToken(project.projectId, {
      name: parsed.data.name,
      expiresIn: parsed.data.expiresIn,
    });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
