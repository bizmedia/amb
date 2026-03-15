import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, Prisma, setProjectContext, setTenantContext } from "@amb-app/db";
import { PrismaPg } from "@prisma/adapter-pg";
import { NotFoundError } from "@amb-app/shared";

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

  async withProjectContext<T>(
    projectId: string,
    fn: (tx: Prisma.TransactionClient, context: { projectId: string; tenantId: string }) => Promise<T>
  ): Promise<T> {
    const project = await this.project.findUnique({
      where: { id: projectId },
      select: { id: true, tenantId: true },
    });

    if (!project) {
      throw new NotFoundError("Project");
    }

    if (!project.tenantId) {
      throw new NotFoundError("Tenant", "Project is not bound to a tenant");
    }

    return this.$transaction(async (tx) => {
      await setTenantContext(tx, project.tenantId!);
      await setProjectContext(tx, project.id);
      return fn(tx, { projectId: project.id, tenantId: project.tenantId! });
    });
  }
}
