import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, handleApiError } from "@/lib/api/errors";
import { listThreadMessages } from "@/lib/services/threads";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return jsonError(400, "invalid_params", "Invalid thread id", parsed.error.flatten());
    }

    const messages = await listThreadMessages(parsed.data.id);
    return NextResponse.json({ data: messages });
  } catch (error) {
    return handleApiError(error);
  }
}
