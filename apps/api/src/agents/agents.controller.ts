import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AgentsService } from "./agents.service";
import { createAgentSchema, updateAgentSchema, uuidSchema } from "@amb-app/shared";
import type { Agent } from "@amb-app/db";
import { ProjectGuard } from "../common/project.guard";
import { ProjectId } from "../common/project.decorator";
import type { RequestWithAuth } from "../common/auth-context";
import { assertAgentWriteAccess } from "../common/project-write-access";

@Controller("agents")
@UseGuards(ProjectGuard)
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Get()
  async list(@ProjectId() projectId: string): Promise<{ data: Agent[] }> {
    const data = await this.agents.list(projectId);
    return { data };
  }

  @Post()
  async create(
    @Req() req: RequestWithAuth,
    @ProjectId() projectId: string,
    @Body() body: unknown
  ): Promise<{ data: Agent }> {
    assertAgentWriteAccess(req.auth, projectId);
    const parsed = createAgentSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.agents.create(projectId, parsed.data);
    return { data };
  }

  @Get("search")
  async search(
    @ProjectId() projectId: string,
    @Query("q") q?: string
  ): Promise<{ data: Agent[] }> {
    const data = await this.agents.search(projectId, q ?? "");
    return { data };
  }

  @Get(":id")
  async getById(
    @ProjectId() projectId: string,
    @Param("id") id: string
  ): Promise<{ data: Agent }> {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) throw parsed.error;
    const data = await this.agents.getById(projectId, parsed.data);
    return { data };
  }

  @Delete(":id")
  async delete(
    @Req() req: RequestWithAuth,
    @ProjectId() projectId: string,
    @Param("id") id: string
  ): Promise<{ data: { success: true } }> {
    assertAgentWriteAccess(req.auth, projectId);
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) throw parsed.error;
    await this.agents.delete(projectId, parsed.data);
    return { data: { success: true } };
  }

  @Patch(":id")
  async update(
    @Req() req: RequestWithAuth,
    @ProjectId() projectId: string,
    @Param("id") id: string,
    @Body() body: unknown
  ): Promise<{ data: Agent }> {
    assertAgentWriteAccess(req.auth, projectId);
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) throw parsedId.error;
    const parsed = updateAgentSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.agents.update(projectId, parsedId.data, parsed.data);
    return { data };
  }
}
