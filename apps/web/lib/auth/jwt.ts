export type JwtPayload = {
  sub?: string;
  userId?: string;
  email?: string;
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

export function isJwtExpired(payload: JwtPayload, nowMs: number = Date.now()): boolean {
  if (typeof payload.exp !== "number") return true;
  return nowMs >= payload.exp * 1000;
}
