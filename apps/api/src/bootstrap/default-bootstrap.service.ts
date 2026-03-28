import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { hashPassword } from "../auth/password";
import {
  DEFAULT_PROJECT_ID,
  DEFAULT_PROJECT_SLUG,
  DEFAULT_TENANT_ID,
  DEFAULT_TENANT_SLUG,
} from "../common/tenant-project.constants";

const DEFAULT_ADMIN_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const DEFAULT_ADMIN_EMAIL = "admin@local.test";
const DEFAULT_ADMIN_PASSWORD = "ChangeMe123!";
const DEFAULT_PROJECT_NAME = "Default Project";
const DEFAULT_PROJECT_PREFIX = "AMB";

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

    await this.prisma.project.upsert({
      where: { id: DEFAULT_PROJECT_ID },
      update: {
        tenantId: DEFAULT_TENANT_ID,
        name: DEFAULT_PROJECT_NAME,
        slug: DEFAULT_PROJECT_SLUG,
        taskPrefix: DEFAULT_PROJECT_PREFIX,
      },
      create: {
        id: DEFAULT_PROJECT_ID,
        tenantId: DEFAULT_TENANT_ID,
        name: DEFAULT_PROJECT_NAME,
        slug: DEFAULT_PROJECT_SLUG,
        taskPrefix: DEFAULT_PROJECT_PREFIX,
        taskSequence: 0,
      },
    });

    await this.prisma.user.upsert({
      where: { email: DEFAULT_ADMIN_EMAIL },
      update: {
        tenantId: DEFAULT_TENANT_ID,
        displayName: "Default Admin",
        roles: ["tenant-admin"],
        isActive: true,
      },
      create: {
        id: DEFAULT_ADMIN_ID,
        tenantId: DEFAULT_TENANT_ID,
        email: DEFAULT_ADMIN_EMAIL,
        passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
        displayName: "Default Admin",
        roles: ["tenant-admin"],
        isActive: true,
      },
    });

    this.logger.log(
      `Bootstrap complete: user=${DEFAULT_ADMIN_EMAIL}, project=${DEFAULT_PROJECT_NAME} (${DEFAULT_PROJECT_ID})`
    );
  }
}
