import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG } from "../common/default-tenant.constants";

@Injectable()
export class DefaultBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(DefaultBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    if (process.env.AMB_BOOTSTRAP !== "true") {
      return;
    }

    await this.prisma.tenant.upsert({
      where: { id: DEFAULT_TENANT_ID },
      update: {
        name: "Default Tenant",
        slug: DEFAULT_TENANT_SLUG,
      },
      create: {
        id: DEFAULT_TENANT_ID,
        name: "Default Tenant",
        slug: DEFAULT_TENANT_SLUG,
      },
    });

    this.logger.log(
      `Bootstrap complete: tenant=${DEFAULT_TENANT_SLUG} (register via signup; create a project in the Dashboard)`
    );
  }
}
