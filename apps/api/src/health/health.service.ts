import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const startedAt = Date.now();
    let dbOk = false;
    let dbError: string | undefined;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch (error) {
      dbError = error instanceof Error ? error.message : "unknown_error";
    }

    const status = dbOk ? "ok" : "degraded";
    return {
      status,
      timestamp: new Date().toISOString(),
      uptimeSec: Number(process.uptime().toFixed(2)),
      latencyMs: Date.now() - startedAt,
      checks: {
        db: {
          status: dbOk ? "up" : "down",
          ...(dbError ? { error: dbError } : {}),
        },
      },
    };
  }
}
