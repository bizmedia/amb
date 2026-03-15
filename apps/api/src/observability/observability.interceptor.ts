import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { ObservabilityService } from "./observability.service";

@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  constructor(private readonly metrics: ObservabilityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<{
      method?: string;
      route?: { path?: string };
      url?: string;
    }>();
    const res = http.getResponse<{ statusCode?: number }>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.record(req.method ?? "GET", req.route?.path ?? req.url ?? "", res.statusCode ?? 200, startedAt);
        },
        error: () => {
          this.record(req.method ?? "GET", req.route?.path ?? req.url ?? "", res.statusCode ?? 500, startedAt);
        },
      })
    );
  }

  private record(method: string, route: string, statusCode: number, startedAt: number) {
    const durationMs = Date.now() - startedAt;
    this.metrics.record(method, route, statusCode, durationMs);
    this.logger.log(
      JSON.stringify({
        type: "http_request",
        method,
        route,
        statusCode,
        durationMs,
        ts: new Date().toISOString(),
      })
    );
  }
}
