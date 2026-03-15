import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth/constants";

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
