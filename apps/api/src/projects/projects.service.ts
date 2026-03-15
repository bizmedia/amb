import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundError } from "@amb-app/shared";

const DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_SLUG = "default";

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

  async ensureDefault() {
    return this.prisma.project.upsert({
      where: { slug: DEFAULT_SLUG },
      update: {},
      create: {
        id: DEFAULT_PROJECT_ID,
        name: "Default Project",
        slug: DEFAULT_SLUG,
      },
    });
  }

  async list() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async create(name: string) {
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
      data: { name: name.trim(), slug: candidate },
    });
  }

  async getById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) throw new NotFoundError("Project");
    return project;
  }
}
