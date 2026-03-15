import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { AuthContext, RequestWithAuth } from "./auth-context";
import { IS_PUBLIC_KEY } from "./public.decorator";

type JwtHeader = {
  alg?: string;
  typ?: string;
};

type JwtPayload = {
  sub?: string;
  userId?: string;
  tenantId?: string;
  projectId?: string;
  roles?: string[];
  type?: string;
  iat?: number;
  nbf?: number;
  exp?: number;
};

const UUID_LIKE_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_SUBJECTS = new Set(["user", "project"]);

function toBase64Url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return Buffer.from(padded, "base64").toString("utf8");
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const authHeader = request.headers.authorization;
    const token = this.extractBearerToken(authHeader);
    const strictMode = process.env.JWT_REQUIRED === "true";

    if (!token) {
      if (strictMode) {
        throw new UnauthorizedException("Missing bearer token");
      }
      return true;
    }

    const auth = this.verifyToken(token);
    request.auth = auth;
    return true;
  }

  private extractBearerToken(
    authHeader: string | string[] | undefined
  ): string | null {
    if (!authHeader) return null;
    const value = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (!value) return null;
    const [scheme, token] = value.split(" ");
    if (!scheme || !token) return null;
    if (scheme.toLowerCase() !== "bearer") {
      throw new BadRequestException("Authorization header must use Bearer scheme");
    }
    return token;
  }

  private verifyToken(token: string): AuthContext {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET is not configured");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new UnauthorizedException("Invalid JWT format");
    }

    const encodedHeader = parts[0];
    const encodedPayload = parts[1];
    const encodedSignature = parts[2];
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new UnauthorizedException("Invalid JWT format");
    }

    let header: JwtHeader;
    let payload: JwtPayload;
    try {
      header = JSON.parse(decodeBase64Url(encodedHeader)) as JwtHeader;
      payload = JSON.parse(decodeBase64Url(encodedPayload)) as JwtPayload;
    } catch {
      throw new UnauthorizedException("Invalid JWT payload");
    }

    if (header.alg !== "HS256") {
      throw new UnauthorizedException("Unsupported JWT algorithm");
    }

    const expectedSignature = toBase64Url(
      createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest()
    );

    const actualSigBuf = Buffer.from(encodedSignature);
    const expectedSigBuf = Buffer.from(expectedSignature);
    if (
      actualSigBuf.length !== expectedSigBuf.length ||
      !timingSafeEqual(actualSigBuf, expectedSigBuf)
    ) {
      throw new UnauthorizedException("Invalid JWT signature");
    }

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.nbf === "number" && payload.nbf > now) {
      throw new UnauthorizedException("JWT is not active yet");
    }
    if (typeof payload.exp === "number" && payload.exp <= now) {
      throw new UnauthorizedException("JWT is expired");
    }

    if (!payload.sub || typeof payload.sub !== "string") {
      throw new UnauthorizedException("JWT claim 'sub' is required");
    }
    if (!ALLOWED_SUBJECTS.has(payload.sub)) {
      throw new UnauthorizedException("JWT claim 'sub' must be 'user' or 'project'");
    }

    if (typeof payload.tenantId !== "string" || !UUID_LIKE_RE.test(payload.tenantId)) {
      throw new UnauthorizedException("JWT claim 'tenantId' must be a valid UUID");
    }

    if (payload.projectId !== undefined) {
      if (typeof payload.projectId !== "string" || !UUID_LIKE_RE.test(payload.projectId)) {
        throw new UnauthorizedException("JWT claim 'projectId' must be a valid UUID");
      }
    }

    if (payload.sub === "project" && !payload.projectId) {
      throw new UnauthorizedException("JWT claim 'projectId' is required for project token");
    }

    if (payload.sub === "user") {
      if (!Array.isArray(payload.roles) || payload.roles.some((role) => typeof role !== "string")) {
        throw new UnauthorizedException("JWT claim 'roles' is required for user token");
      }
    }

    return {
      subject: payload.sub,
      tenantId: payload.tenantId,
      projectId: payload.projectId,
      roles: Array.isArray(payload.roles) ? payload.roles : undefined,
      tokenType: typeof payload.type === "string" ? payload.type : undefined,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
  }
}
