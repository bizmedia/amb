import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundError } from "@amb-app/shared";
import {
  DEFAULT_PROJECT_ID,
  DEFAULT_TENANT_ID,
  DEFAULT_TENANT_SLUG,
} from "../common/tenant-project.constants";

function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async create(name: string) {
    const tenant = await this.prisma.tenant.upsert({
      where: { slug: DEFAULT_TENANT_SLUG },
      update: {},
      create: {
        id: DEFAULT_TENANT_ID,
        name: "Default Tenant",
        slug: DEFAULT_TENANT_SLUG,
      },
    });

    const base = toSlug(name) || "project";
    let candidate = base;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.project.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!existing) break;
      counter += 1;
      candidate = `${base}-${counter}`;
    }
    return this.prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: name.trim(),
        slug: candidate,
      },
    });
  }

  async getById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) throw new NotFoundError("Project");
    return project;
  }

  async update(id: string, name: string) {
    await this.getById(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    if (id === DEFAULT_PROJECT_ID) {
      throw new BadRequestException("Cannot delete the default project");
    }
    await this.getById(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.projectTokenAudit.deleteMany({ where: { projectId: id } });
      await tx.projectToken.deleteMany({ where: { projectId: id } });
      await tx.message.deleteMany({ where: { projectId: id } });
      await tx.thread.deleteMany({ where: { projectId: id } });
      await tx.agent.deleteMany({ where: { projectId: id } });
      await tx.issue.deleteMany({ where: { projectId: id } });
      await tx.project.delete({ where: { id } });
    });
  }
}
