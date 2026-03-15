import { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE_NAME = "amb_access_token";

function parseBearerToken(authorization: string | null): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (!scheme || !token) return undefined;
  if (scheme.toLowerCase() !== "bearer") return undefined;
  return token;
}

function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(";");
  for (const rawCookie of cookies) {
    const [rawName, ...rest] = rawCookie.trim().split("=");
    if (!rawName || rest.length === 0) continue;
    if (rawName !== name) continue;
    return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function getRequestAuthToken(request: Request): string | undefined {
  const tokenFromHeader = parseBearerToken(request.headers.get("authorization"));
  if (tokenFromHeader) return tokenFromHeader;
  return getCookieValue(request.headers.get("cookie"), ACCESS_TOKEN_COOKIE_NAME);
}

export function setAccessTokenCookie(
  response: NextResponse,
  token: string,
  expiresInSeconds: number
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expiresInSeconds,
  });
}

export function clearAccessTokenCookie(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

type JwtPayload = {
  sub?: string;
  userId?: string;
  tenantId?: string;
  projectId?: string;
  roles?: string[];
  type?: string;
  iat?: number;
  exp?: number;
};

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const payload = parts[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(padLength);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
