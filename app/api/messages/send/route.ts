import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { sendMessage } from "@/lib/services/messages";
import { Prisma } from "../../../../prisma/generated/client";

const sendMessageSchema = z.object({
  threadId: z.string().uuid(),
  fromAgentId: z.string().uuid(),
  toAgentId: z.string().uuid().optional().nullable(),
  payload: z.unknown(),
  parentId: z.string().uuid().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonError(400, "invalid_json", "Request body must be valid JSON");
    }

    const result = sendMessageSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const message = await sendMessage({
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
