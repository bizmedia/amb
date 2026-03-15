import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import type { RequestWithAuth } from "./auth-context";

type Bucket = {
  windowStart: number;
  count: number;
};

const DEFAULT_WINDOW_MS = 60_000;
/** Большой запас: 20k req/min на бакет. Отключить: RATE_LIMIT_MAX_REQUESTS=0 */
const DEFAULT_MAX_REQUESTS = 20_000;
const DEFAULT_TENANT_KEY = "00000000-0000-0000-0000-000000000001";

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAuth & {
      method?: string;
      url?: string;
      headers: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
      ip?: string;
    }>();

    const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? DEFAULT_WINDOW_MS);
    const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? DEFAULT_MAX_REQUESTS);
    if (!Number.isFinite(windowMs) || !Number.isFinite(maxRequests) || maxRequests <= 0) {
      return true;
    }

    const now = Date.now();
    const key = this.getBucketKey(request);
    const current = this.buckets.get(key);
    if (!current || now - current.windowStart >= windowMs) {
      this.buckets.set(key, { windowStart: now, count: 1 });
      this.cleanup(now, windowMs);
      return true;
    }

    if (current.count >= maxRequests) {
      throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
    }

    current.count += 1;
    return true;
  }

  private getBucketKey(request: RequestWithAuth & {
    headers: Record<string, string | string[] | undefined>;
    method?: string;
    ip?: string;
    socket?: { remoteAddress?: string };
  }): string {
    const headerProjectRaw = request.headers["x-project-id"];
    const headerProject = Array.isArray(headerProjectRaw)
      ? headerProjectRaw[0]
      : headerProjectRaw;
    const projectId =
      request.auth?.projectId ??
      request.params?.projectId ??
      request.query?.projectId ??
      headerProject ??
      "default-project";

    const tenantId = request.auth?.tenantId ?? DEFAULT_TENANT_KEY;
    const ip =
      (Array.isArray(request.headers["x-forwarded-for"])
        ? request.headers["x-forwarded-for"][0]
        : request.headers["x-forwarded-for"]) ??
      request.ip ??
      request.socket?.remoteAddress ??
      "unknown-ip";
    const method = request.method ?? "GET";
    return `${tenantId}:${projectId}:${ip}:${method}`;
  }

  private cleanup(now: number, windowMs: number) {
    if (this.buckets.size < 1000) return;
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.windowStart >= windowMs) {
        this.buckets.delete(key);
      }
    }
  }
}
