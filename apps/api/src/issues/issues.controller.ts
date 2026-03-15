import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { IssuesService } from "./issues.service";
import {
  createIssueSchema,
  listIssuesQuerySchema,
  updateIssueSchema,
} from "@amb-app/shared";
import { ProjectParamGuard } from "../common/project-param.guard";
import { ProjectIdParam } from "../common/project-param.decorator";

@Controller("projects/:projectId/issues")
@UseGuards(ProjectParamGuard)
export class IssuesController {
  constructor(private readonly issues: IssuesService) {}

  @Get()
  async list(
    @ProjectIdParam() projectId: string,
    @Query() query: Record<string, string>
  ) {
    const parsed = listIssuesQuerySchema.safeParse({
      state: query.state ?? undefined,
      priority: query.priority ?? undefined,
      assignee: query.assignee ?? undefined,
      dueFrom: query.dueFrom ? new Date(query.dueFrom) : undefined,
      dueTo: query.dueTo ? new Date(query.dueTo) : undefined,
    });
    if (!parsed.success) throw parsed.error;
    const data = await this.issues.list(projectId, {
      state: parsed.data.state,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assignee,
      dueFrom: parsed.data.dueFrom,
      dueTo: parsed.data.dueTo,
    });
    return { data };
  }

  @Post()
  async create(@ProjectIdParam() projectId: string, @Body() body: unknown) {
    const parsed = createIssueSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.issues.create(projectId, parsed.data);
    return { data };
  }

  @Get(":id")
  async getById(
    @ProjectIdParam() projectId: string,
    @Param("id") id: string
  ) {
    const data = await this.issues.getById(projectId, id);
    return { data };
  }

  @Patch(":id")
  async update(
    @ProjectIdParam() projectId: string,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const parsed = updateIssueSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.issues.update(projectId, id, parsed.data);
    return { data };
  }

  @Delete(":id")
  async delete(
    @ProjectIdParam() projectId: string,
    @Param("id") id: string
  ) {
    await this.issues.delete(projectId, id);
    return { data: { success: true } };
  }
}
