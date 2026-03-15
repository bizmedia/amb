import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { createProjectSchema } from "@amb-app/shared";
import { ProjectGuard } from "../common/project.guard";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  async list() {
    await this.projects.ensureDefault();
    const data = await this.projects.list();
    return { data };
  }

  @Post()
  async create(@Body() body: unknown) {
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.projects.create(parsed.data.name);
    return { data };
  }
}
