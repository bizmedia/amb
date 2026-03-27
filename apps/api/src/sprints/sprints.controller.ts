import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { SprintsService } from "./sprints.service";
import {
  createSprintSchema,
  listSprintsQuerySchema,
  updateSprintSchema,
} from "@amb-app/shared";
import { ProjectParamGuard } from "../common/project-param.guard";
import { ProjectIdParam } from "../common/project-param.decorator";

@Controller("projects/:projectId/sprints")
@UseGuards(ProjectParamGuard)
export class SprintsController {
  constructor(private readonly sprints: SprintsService) {}

  @Get()
  async list(
    @ProjectIdParam() projectId: string,
    @Query() query: Record<string, string>
  ) {
    const parsed = listSprintsQuerySchema.safeParse({
      status: query.status ?? undefined,
    });
    if (!parsed.success) throw parsed.error;
    const data = await this.sprints.list(projectId, {
      status: parsed.data.status,
    });
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@ProjectIdParam() projectId: string, @Body() body: unknown) {
    const parsed = createSprintSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.sprints.create(projectId, parsed.data);
    return { data };
  }

  @Post(":sprintId/start")
  @HttpCode(HttpStatus.OK)
  async start(
    @ProjectIdParam() projectId: string,
    @Param("sprintId") sprintId: string
  ) {
    const data = await this.sprints.start(projectId, sprintId);
    return { data };
  }

  @Post(":sprintId/complete")
  @HttpCode(HttpStatus.OK)
  async complete(
    @ProjectIdParam() projectId: string,
    @Param("sprintId") sprintId: string
  ) {
    const data = await this.sprints.complete(projectId, sprintId);
    return { data };
  }

  @Get(":sprintId")
  async getOne(
    @ProjectIdParam() projectId: string,
    @Param("sprintId") sprintId: string
  ) {
    const data = await this.sprints.getById(projectId, sprintId);
    return { data };
  }

  @Patch(":sprintId")
  async update(
    @ProjectIdParam() projectId: string,
    @Param("sprintId") sprintId: string,
    @Body() body: unknown
  ) {
    const parsed = updateSprintSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.sprints.update(projectId, sprintId, parsed.data);
    return { data };
  }

  @Delete(":sprintId")
  async delete(
    @ProjectIdParam() projectId: string,
    @Param("sprintId") sprintId: string
  ) {
    await this.sprints.deletePlanned(projectId, sprintId);
    return { data: { success: true } };
  }
}
