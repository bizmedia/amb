import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@amb-app/db";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const adapter = connectionString
      ? new PrismaPg({ connectionString })
      : undefined;
    super(
      (adapter
        ? { adapter, log: ["error", "warn"] as const }
        : { log: ["error", "warn"] as const }) as ConstructorParameters<
        typeof PrismaClient
      >[0]
    );
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
