import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { retryAllDlqMessages } from "@/lib/services/messages";

export async function POST() {
  try {
    const result = await retryAllDlqMessages();
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
