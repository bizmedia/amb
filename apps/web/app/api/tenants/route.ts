import { NextResponse } from "next/server";

import { getApiClient } from "@/lib/api/client";
import { getRequestAuthToken } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/errors";

export async function GET(request: Request) {
  try {
    const token = getRequestAuthToken(request);
    const client = getApiClient({ token });
    const tenants = await client.listTenants();
    return NextResponse.json({ data: tenants });
  } catch (error) {
    return handleApiError(error);
  }
}
