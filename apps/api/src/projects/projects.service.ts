import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundError } from "@amb-app/shared";
import { Prisma } from "@amb-app/db";
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

function generatePrefix(name: string): string {
  return name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
}

function toAlphaSuffix(counter: number): string {
  let value = counter;
  let suffix = "";

  while (value > 0) {
    value -= 1;
    suffix = String.fromCharCode(65 + (value % 26)) + suffix;
    value = Math.floor(value / 26);
  }

  return suffix;
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async create(name: string, taskPrefix?: string) {
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

    const trimmedName = name.trim();

    if (taskPrefix) {
      const prefix = await this.ensureExplicitPrefixUnique(tenant.id, taskPrefix);
      return this.prisma.project.create({
        data: {
          tenantId: tenant.id,
          name: trimmedName,
          slug: candidate,
          taskPrefix: prefix,
          taskSequence: 0,
        },
      });
    }

    for (let attempt = 0; attempt < 50; attempt += 1) {
      const prefix = await this.generateUniquePrefix(tenant.id, name, attempt);

      try {
        return await this.prisma.project.create({
          data: {
            tenantId: tenant.id,
            name: trimmedName,
            slug: candidate,
            taskPrefix: prefix,
            taskSequence: 0,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException(
      `Unable to generate a unique task prefix for project "${trimmedName}"`
    );
  }

  async getById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) throw new NotFoundError("Project");
    return project;
  }

  async update(
    id: string,
    data: { name?: string; taskPrefix?: string },
  ) {
    const project = await this.getById(id);

    if (data.taskPrefix && project.tenantId) {
      await this.ensurePrefixUnique(project.tenantId, data.taskPrefix, id);
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.taskPrefix !== undefined
          ? { taskPrefix: data.taskPrefix }
          : {}),
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
      await tx.task.deleteMany({ where: { projectId: id } });
      await tx.project.delete({ where: { id } });
    });
  }

  private async ensurePrefixUnique(
    tenantId: string,
    prefix: string,
    excludeProjectId?: string,
  ): Promise<void> {
    const existing = await this.prisma.project.findFirst({
      where: {
        tenantId,
        taskPrefix: prefix,
        ...(excludeProjectId ? { id: { not: excludeProjectId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        `Task prefix "${prefix}" is already used by another project in this tenant`,
      );
    }
  }

  private async ensureExplicitPrefixUnique(
    tenantId: string,
    prefix: string,
  ): Promise<string> {
    await this.ensurePrefixUnique(tenantId, prefix);
    return prefix;
  }

  private async generateUniquePrefix(
    tenantId: string,
    name: string,
    startCounter = 0,
  ): Promise<string> {
    const basePrefix = generatePrefix(name);

    for (let counter = startCounter; counter < startCounter + 26 * 26; counter += 1) {
      const suffix = counter === 0 ? "" : toAlphaSuffix(counter);
      const candidate = `${basePrefix}${suffix}`.slice(0, 5);

      const existing = await this.prisma.project.findFirst({
        where: {
          tenantId,
          taskPrefix: candidate,
        },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }
    }

    throw new ConflictException(
      `Unable to generate a unique task prefix for project "${name.trim()}"`
    );
  }
}
