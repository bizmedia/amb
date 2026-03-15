import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { Observable, tap } from "rxjs";
import { ObservabilityService } from "./observability.service";
import type { RequestWithAuth } from "../common/auth-context";

const TRACEPARENT_RE = /^00-([a-f0-9]{32})-([a-f0-9]{16})-[a-f0-9]{2}$/i;

function generateTraceId(): string {
  return randomBytes(16).toString("hex");
}

function generateSpanId(): string {
  return randomBytes(8).toString("hex");
}

@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  constructor(private readonly metrics: ObservabilityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<RequestWithAuth & {
      method?: string;
      route?: { path?: string };
      url?: string;
    }>();
    const res = http.getResponse<{
      statusCode?: number;
      setHeader?: (name: string, value: string) => void;
    }>();
    const startedAt = Date.now();
    const { traceId, spanId } = this.resolveTrace(req);
    req.traceId = traceId;
    req.spanId = spanId;
    res.setHeader?.("x-request-id", traceId);
    res.setHeader?.("traceparent", `00-${traceId}-${spanId}-01`);

    return next.handle().pipe(
      tap({
        next: () => {
          this.record(
            req.method ?? "GET",
            req.route?.path ?? req.url ?? "",
            res.statusCode ?? 200,
            startedAt,
            traceId,
            spanId
          );
        },
        error: () => {
          this.record(
            req.method ?? "GET",
            req.route?.path ?? req.url ?? "",
            res.statusCode ?? 500,
            startedAt,
            traceId,
            spanId
          );
        },
      })
    );
  }

  private resolveTrace(
    req: RequestWithAuth & { headers: Record<string, string | string[] | undefined> }
  ): { traceId: string; spanId: string } {
    const requestIdRaw = req.headers["x-request-id"];
    const requestId = Array.isArray(requestIdRaw) ? requestIdRaw[0] : requestIdRaw;
    if (requestId && requestId.trim().length > 0) {
      return { traceId: requestId.trim(), spanId: generateSpanId() };
    }

    const traceparentRaw = req.headers["traceparent"];
    const traceparent = Array.isArray(traceparentRaw) ? traceparentRaw[0] : traceparentRaw;
    if (traceparent) {
      const match = traceparent.match(TRACEPARENT_RE);
      if (match?.[1]) {
        return { traceId: match[1], spanId: generateSpanId() };
      }
    }

    return { traceId: generateTraceId(), spanId: generateSpanId() };
  }

  private record(
    method: string,
    route: string,
    statusCode: number,
    startedAt: number,
    traceId: string,
    spanId: string
  ) {
    const durationMs = Date.now() - startedAt;
    this.metrics.record(method, route, statusCode, durationMs);
    this.logger.log(
      JSON.stringify({
        type: "http_request",
        method,
        route,
        statusCode,
        durationMs,
        traceId,
        spanId,
        ts: new Date().toISOString(),
      })
    );
  }
}
