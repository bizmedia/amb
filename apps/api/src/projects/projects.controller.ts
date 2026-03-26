import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { createProjectSchema, projectIdSchema, updateProjectSchema } from "@amb-app/shared";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  async list() {
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

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    const parsedId = projectIdSchema.safeParse(id);
    if (!parsedId.success) throw parsedId.error;
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.projects.update(parsedId.data, parsed.data.name);
    return { data };
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    const parsedId = projectIdSchema.safeParse(id);
    if (!parsedId.success) throw parsedId.error;
    await this.projects.delete(parsedId.data);
    return { data: { success: true } };
  }
}
