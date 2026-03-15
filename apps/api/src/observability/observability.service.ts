import { Injectable } from "@nestjs/common";

type MetricRow = {
  key: string;
  method: string;
  route: string;
  statusCode: number;
  count: number;
  totalDurationMs: number;
  avgDurationMs: number;
  lastSeenAt: string;
};

@Injectable()
export class ObservabilityService {
  private readonly counters = new Map<
    string,
    {
      method: string;
      route: string;
      statusCode: number;
      count: number;
      totalDurationMs: number;
      lastSeenAt: number;
    }
  >();

  record(method: string, route: string, statusCode: number, durationMs: number) {
    const normalizedMethod = method.toUpperCase();
    const normalizedRoute = route || "unknown";
    const key = `${normalizedMethod}:${normalizedRoute}:${statusCode}`;
    const existing = this.counters.get(key);
    if (!existing) {
      this.counters.set(key, {
        method: normalizedMethod,
        route: normalizedRoute,
        statusCode,
        count: 1,
        totalDurationMs: durationMs,
        lastSeenAt: Date.now(),
      });
      return;
    }

    existing.count += 1;
    existing.totalDurationMs += durationMs;
    existing.lastSeenAt = Date.now();
  }

  snapshot(): { data: MetricRow[] } {
    const data: MetricRow[] = Array.from(this.counters.entries())
      .map(([key, value]) => ({
        key,
        method: value.method,
        route: value.route,
        statusCode: value.statusCode,
        count: value.count,
        totalDurationMs: Number(value.totalDurationMs.toFixed(2)),
        avgDurationMs: Number((value.totalDurationMs / value.count).toFixed(2)),
        lastSeenAt: new Date(value.lastSeenAt).toISOString(),
      }))
      .sort((a, b) => b.count - a.count);
    return { data };
  }
}
