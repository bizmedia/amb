import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { searchAgents } from "@/lib/services/agents";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";

    const agents = await searchAgents(query);
    return NextResponse.json({ data: agents });
  } catch (error) {
    return handleApiError(error);
  }
}
