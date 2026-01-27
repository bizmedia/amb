import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { retryDlqMessage } from "@/lib/services/messages";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const message = await retryDlqMessage(id);
    return NextResponse.json({ data: message });
  } catch (error) {
    return handleApiError(error);
  }
}
