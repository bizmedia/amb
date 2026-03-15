import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ThreadsService,
  ThreadWithMessages,
} from "./threads.service";
import { createThreadSchema, updateThreadSchema } from "@amb-app/shared";
import type { Message, Thread } from "@amb-app/db";
import { ProjectGuard } from "../common/project.guard";
import { ProjectId } from "../common/project.decorator";

@Controller("threads")
@UseGuards(ProjectGuard)
export class ThreadsController {
  constructor(private readonly threads: ThreadsService) {}

  @Get()
  async list(
    @ProjectId() projectId: string
  ): Promise<{ data: ThreadWithMessages[] }> {
    const data = await this.threads.list(projectId);
    return { data };
  }

  @Post()
  async create(
    @ProjectId() projectId: string,
    @Body() body: unknown
  ): Promise<{ data: Thread }> {
    const parsed = createThreadSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.threads.create(projectId, parsed.data);
    return { data };
  }

  @Get(":id")
  async getById(
    @ProjectId() projectId: string,
    @Param("id") id: string
  ): Promise<{ data: Thread }> {
    const data = await this.threads.getById(projectId, id);
    return { data };
  }

  @Get(":id/messages")
  async listMessages(
    @ProjectId() projectId: string,
    @Param("id") id: string
  ): Promise<{ data: Message[] }> {
    const data = await this.threads.listMessages(projectId, id);
    return { data };
  }

  @Patch(":id")
  async update(
    @ProjectId() projectId: string,
    @Param("id") id: string,
    @Body() body: unknown
  ): Promise<{ data: Thread }> {
    const parsed = updateThreadSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.threads.updateStatus(projectId, id, parsed.data.status);
    return { data };
  }

  @Delete(":id")
  async delete(
    @ProjectId() projectId: string,
    @Param("id") id: string
  ): Promise<{ data: { success: true } }> {
    await this.threads.delete(projectId, id);
    return { data: { success: true } };
  }
}
