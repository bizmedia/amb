import { NextResponse } from "next/server";
import { clearAccessTokenCookie, getRequestAuthToken } from "@/lib/api/auth";
import { decodeJwtPayload, isJwtExpired } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  const token = getRequestAuthToken(request);
  if (!token) {
    return NextResponse.json({ data: { authenticated: false } });
  }

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    const response = NextResponse.json({ data: { authenticated: false } }, { status: 401 });
    clearAccessTokenCookie(response);
    return response;
  }

  const expiresAtMs = payload.exp * 1000;
  if (isJwtExpired(payload)) {
    const response = NextResponse.json({ data: { authenticated: false } }, { status: 401 });
    clearAccessTokenCookie(response);
    return response;
  }

  return NextResponse.json({
    data: {
      authenticated: true,
      tokenType: payload.type ?? null,
      userId: payload.userId ?? null,
      email: typeof payload.email === "string" ? payload.email : null,
      tenantId: payload.tenantId ?? null,
      projectId: payload.projectId ?? null,
      roles: payload.roles ?? [],
      expiresAt: new Date(expiresAtMs).toISOString(),
    },
  });
}
