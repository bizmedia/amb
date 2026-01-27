import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { getThreadById, updateThreadStatus, deleteThread } from "@/lib/services/threads";

type RouteParams = {
  params: Promise<{ id: string }>;
};

const updateThreadSchema = z.object({
  status: z.enum(["open", "closed", "archived"]),
});

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const thread = await getThreadById(id);
    return NextResponse.json({ data: thread });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return jsonError(400, "invalid_json", "Request body must be valid JSON");
    }

    const result = updateThreadSchema.safeParse(body);
    if (!result.success) {
      return jsonError(400, "invalid_request", "Invalid request body", result.error.flatten());
    }

    const thread = await updateThreadStatus(id, result.data.status);
    return NextResponse.json({ data: thread });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteThread(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
