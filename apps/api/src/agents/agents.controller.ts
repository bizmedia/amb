import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AgentsService } from "./agents.service";
import { createAgentSchema } from "@amb-app/shared";
import type { Agent } from "@amb-app/db";
import { ProjectGuard } from "../common/project.guard";
import { ProjectId } from "../common/project.decorator";

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
    @ProjectId() projectId: string,
    @Body() body: unknown
  ): Promise<{ data: Agent }> {
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
}
