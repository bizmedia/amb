import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { createHmac, randomUUID } from "node:crypto";
import { verifyPassword } from "./password";
import type { AuthContext } from "../common/auth-context";

const USER_TOKEN_TTL_SECONDS = 60 * 60;
const PROJECT_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

function toBase64Url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signHs256(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = toBase64Url(Buffer.from(JSON.stringify(header), "utf8"));
  const encodedPayload = toBase64Url(Buffer.from(JSON.stringify(payload), "utf8"));
  const signature = toBase64Url(
    createHmac("sha256", secret).update(`${encodedHeader}.${encodedPayload}`).digest()
  );
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET is not configured");
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: "user",
      userId: user.id,
      tenantId: user.tenantId,
      roles: user.roles,
      type: "user",
      iat: now,
      exp: now + USER_TOKEN_TTL_SECONDS,
    };
    const accessToken = signHs256(payload, secret);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: USER_TOKEN_TTL_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        tenantId: user.tenantId,
        roles: user.roles,
      },
    };
  }

  async issueProjectToken(
    auth: AuthContext | undefined,
    projectId: string,
    expiresIn?: number
  ) {
    if (!auth || auth.subject !== "user") {
      throw new UnauthorizedException("User token is required");
    }

    const roles = auth.roles ?? [];
    if (!roles.includes("tenant-admin")) {
      throw new ForbiddenException("Only tenant-admin can issue project tokens");
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, tenantId: true },
    });
    if (!project || !project.tenantId || project.tenantId !== auth.tenantId) {
      throw new ForbiddenException("Project is not available in tenant scope");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET is not configured");
    }

    const ttl = expiresIn ?? PROJECT_TOKEN_TTL_SECONDS;
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: "project",
      tenantId: auth.tenantId,
      projectId: project.id,
      type: "project",
      jti: randomUUID(),
      iat: now,
      exp: now + ttl,
    };
    const accessToken = signHs256(payload, secret);
    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: ttl,
      claims: {
        sub: payload.sub,
        tenantId: payload.tenantId,
        projectId: payload.projectId,
        type: payload.type,
        jti: payload.jti,
      },
    };
  }
}
