import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from "@amb-app/shared";
import type { RequestWithAuth } from "../common/auth-context";
import { assertProjectDeleteAccess } from "../common/project-write-access";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  async list() {
    const data = await this.projects.list();
    return { data };
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    const parsedId = projectIdSchema.safeParse(id);
    if (!parsedId.success) throw parsedId.error;
    const data = await this.projects.getById(parsedId.data);
    return { data };
  }

  @Post()
  async create(@Body() body: unknown) {
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.projects.create(
      parsed.data.name,
      parsed.data.taskPrefix,
    );
    return { data };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    const parsedId = projectIdSchema.safeParse(id);
    if (!parsedId.success) throw parsedId.error;
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.projects.update(parsedId.data, parsed.data);
    return { data };
  }

  @Delete(":id")
  async delete(@Req() req: RequestWithAuth, @Param("id") id: string) {
    const parsedId = projectIdSchema.safeParse(id);
    if (!parsedId.success) throw parsedId.error;
    const project = await this.projects.getById(parsedId.data);
    assertProjectDeleteAccess(req.auth, project.id, project.tenantId ?? null);
    await this.projects.delete(parsedId.data);
    return { data: { success: true } };
  }
}
