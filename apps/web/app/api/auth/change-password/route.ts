import { NextResponse } from "next/server";
import { changePasswordSchema } from "@amb-app/shared";

import { API_BASE_URL } from "@/lib/api/client";
import { jsonError } from "@/lib/api/errors";
import { getRequestAuthToken } from "@/lib/api/auth";

type ApiErrorShape = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export async function POST(request: Request) {
  const token = getRequestAuthToken(request);
  if (!token) {
    return jsonError(401, "unauthorized", "Authentication required");
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return jsonError(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "invalid_request", "Invalid request body", parsed.error.flatten());
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return jsonError(503, "service_unavailable", "API service is unavailable");
  }

  const payload = (await response.json().catch(() => null)) as
    | { data?: { success?: boolean } }
    | ApiErrorShape
    | null;

  if (!response.ok) {
    const code =
      payload && "error" in payload && payload.error?.code ? payload.error.code : "http_error";
    const message =
      payload && "error" in payload && payload.error?.message
        ? payload.error.message
        : "Password change failed";
    const details =
      payload && "error" in payload && payload.error?.details
        ? payload.error.details
        : undefined;
    return jsonError(response.status, code, message, details);
  }

  if (!payload || !("data" in payload) || !payload.data?.success) {
    return jsonError(502, "internal_error", "Invalid response from API");
  }

  return NextResponse.json({ data: { success: true } }, { status: 200 });
}
