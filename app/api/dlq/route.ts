import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { getDlqMessages } from "@/lib/services/messages";

export async function GET() {
  try {
    const messages = await getDlqMessages();
    return NextResponse.json({ data: messages });
  } catch (error) {
    return handleApiError(error);
  }
}
