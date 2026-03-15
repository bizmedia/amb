import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { DlqService } from "./dlq.service";
import { messageIdParamsSchema } from "@amb-app/shared";
import type { Message } from "@amb-app/db";
import { ProjectGuard } from "../common/project.guard";
import { ProjectId } from "../common/project.decorator";

@Controller("dlq")
@UseGuards(ProjectGuard)
export class DlqController {
  constructor(private readonly dlq: DlqService) {}

  @Get()
  async list(@ProjectId() projectId: string): Promise<{ data: Message[] }> {
    const data = await this.dlq.list(projectId);
    return { data };
  }

  @Post("retry-all")
  async retryAll(
    @ProjectId() projectId: string
  ): Promise<{ data: { count: number } }> {
    const data = await this.dlq.retryAll(projectId);
    return { data };
  }

  @Post(":id/retry")
  async retry(
    @ProjectId() projectId: string,
    @Param("id") id: string
  ): Promise<{ data: Message }> {
    const parsed = messageIdParamsSchema.safeParse({ id });
    if (!parsed.success) throw parsed.error;
    const data = await this.dlq.retryOne(projectId, parsed.data.id);
    return { data };
  }
}
