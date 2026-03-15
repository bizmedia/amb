import { NextResponse } from "next/server";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { resolveProjectId } from "@/lib/api/project-context";
import { sendMessage } from "@/lib/services/messages";
import { Prisma } from "@amb-app/db";
import { sendMessageSchema } from "@amb-app/shared";

export async function POST(request: Request) {
  try {
    const project = await resolveProjectId(request);
    if (project.error) {
      return project.error;
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonError(400, "invalid_json", "Request body must be valid JSON");
    }

    const result = sendMessageSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const message = await sendMessage({
      projectId: project.projectId,
      threadId: result.data.threadId,
      fromAgentId: result.data.fromAgentId,
      toAgentId: result.data.toAgentId ?? null,
      payload: result.data.payload as Prisma.InputJsonValue,
      parentId: result.data.parentId ?? null,
    });

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
