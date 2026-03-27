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
import { EpicsService } from "./epics.service";
import {
  createEpicSchema,
  listEpicsQuerySchema,
  updateEpicSchema,
} from "@amb-app/shared";
import { ProjectParamGuard } from "../common/project-param.guard";
import { ProjectIdParam } from "../common/project-param.decorator";

@Controller("projects/:projectId/epics")
@UseGuards(ProjectParamGuard)
export class EpicsController {
  constructor(private readonly epics: EpicsService) {}

  @Get()
  async list(
    @ProjectIdParam() projectId: string,
    @Query() query: Record<string, string>
  ) {
    const parsed = listEpicsQuerySchema.safeParse({
      status: query.status ?? undefined,
    });
    if (!parsed.success) throw parsed.error;
    const data = await this.epics.list(projectId, {
      status: parsed.data.status,
    });
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@ProjectIdParam() projectId: string, @Body() body: unknown) {
    const parsed = createEpicSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.epics.create(projectId, parsed.data);
    return { data };
  }

  @Get(":epicId")
  async getOne(
    @ProjectIdParam() projectId: string,
    @Param("epicId") epicId: string
  ) {
    const data = await this.epics.getById(projectId, epicId);
    return { data };
  }

  @Patch(":epicId")
  async update(
    @ProjectIdParam() projectId: string,
    @Param("epicId") epicId: string,
    @Body() body: unknown
  ) {
    const parsed = updateEpicSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.epics.update(projectId, epicId, parsed.data);
    return { data };
  }

  @Delete(":epicId")
  async archive(
    @ProjectIdParam() projectId: string,
    @Param("epicId") epicId: string
  ) {
    const data = await this.epics.archive(projectId, epicId);
    return { data };
  }
}
