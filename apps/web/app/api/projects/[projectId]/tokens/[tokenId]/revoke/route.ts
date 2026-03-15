import { NextResponse } from "next/server";
import { projectTokenParamsSchema } from "@amb-app/shared";

import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectIdParam } from "@/lib/api/project-params";

type RouteParams = { params: Promise<{ projectId: string; tokenId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const token = getRequestAuthToken(request);
    const { projectId: rawProjectId, tokenId } = await params;
    const project = await resolveProjectIdParam(rawProjectId, token);
    if (project.error) return project.error;

    const parsed = projectTokenParamsSchema.safeParse({
      projectId: project.projectId,
      tokenId,
    });
    if (!parsed.success) {
      return jsonError(400, "invalid_params", "Invalid token params", parsed.error.flatten());
    }

    const client = getApiClient({ projectId: project.projectId, token });
    const updated = await client.revokeProjectToken(parsed.data.projectId, parsed.data.tokenId);
    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
