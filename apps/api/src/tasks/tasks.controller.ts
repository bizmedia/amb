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
import { TasksService } from "./tasks.service";
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
  uuidSchema,
} from "@amb-app/shared";
import { ProjectParamGuard } from "../common/project-param.guard";
import { ProjectIdParam } from "../common/project-param.decorator";

@Controller("projects/:projectId/tasks")
@UseGuards(ProjectParamGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  async list(
    @ProjectIdParam() projectId: string,
    @Query() query: Record<string, string>
  ) {
    const parsed = listTasksQuerySchema.safeParse({
      state: query.state ?? undefined,
      priority: query.priority ?? undefined,
      assignee: query.assignee ?? undefined,
      epicId: query.epicId ?? undefined,
      sprintId: query.sprintId ?? undefined,
      key: query.key ?? undefined,
      search: query.search ?? undefined,
      dueFrom: query.dueFrom ? new Date(query.dueFrom) : undefined,
      dueTo: query.dueTo ? new Date(query.dueTo) : undefined,
    });
    if (!parsed.success) throw parsed.error;
    const data = await this.tasks.list(projectId, {
      state: parsed.data.state,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assignee,
      epicId: parsed.data.epicId,
      sprintId: parsed.data.sprintId,
      key: parsed.data.key,
      search: parsed.data.search,
      dueFrom: parsed.data.dueFrom,
      dueTo: parsed.data.dueTo,
    });
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@ProjectIdParam() projectId: string, @Body() body: unknown) {
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.tasks.create(projectId, parsed.data);
    return { data };
  }

  @Get(":idOrKey")
  async getOne(
    @ProjectIdParam() projectId: string,
    @Param("idOrKey") idOrKey: string
  ) {
    const data = uuidSchema.safeParse(idOrKey).success
      ? await this.tasks.getById(projectId, idOrKey)
      : await this.tasks.getByKey(projectId, idOrKey);
    return { data };
  }

  @Patch(":idOrKey")
  async update(
    @ProjectIdParam() projectId: string,
    @Param("idOrKey") idOrKey: string,
    @Body() body: unknown
  ) {
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const taskId = await this.resolveTaskId(projectId, idOrKey);
    const data = await this.tasks.update(projectId, taskId, parsed.data);
    return { data };
  }

  @Delete(":idOrKey")
  async delete(
    @ProjectIdParam() projectId: string,
    @Param("idOrKey") idOrKey: string
  ) {
    const taskId = await this.resolveTaskId(projectId, idOrKey);
    await this.tasks.delete(projectId, taskId);
    return { data: { success: true } };
  }

  private async resolveTaskId(
    projectId: string,
    idOrKey: string
  ): Promise<string> {
    if (uuidSchema.safeParse(idOrKey).success) {
      return idOrKey;
    }
    const task = await this.tasks.getByKey(projectId, idOrKey);
    return task.id;
  }
}
