import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import {
  inboxQuerySchema,
  messageIdParamsSchema,
  sendMessageSchema,
} from "@amb-app/shared";
import type { Message } from "@amb-app/db";
import { ProjectGuard } from "../common/project.guard";
import { ProjectId } from "../common/project.decorator";

@Controller("messages")
@UseGuards(ProjectGuard)
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Post("send")
  async send(
    @ProjectId() projectId: string,
    @Body() body: unknown
  ): Promise<{ data: Message }> {
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;
    const data = await this.messages.send(projectId, parsed.data);
    return { data };
  }

  @Get("inbox")
  async inbox(
    @ProjectId() projectId: string,
    @Query("agentId") agentId: string
  ): Promise<{ data: Message[] }> {
    const result = inboxQuerySchema.safeParse({ agentId });
    if (!result.success) throw result.error;
    const data = await this.messages.getInbox(projectId, result.data.agentId);
    return { data };
  }

  @Post(":id/ack")
  async ack(
    @ProjectId() projectId: string,
    @Param("id") id: string
  ): Promise<{ data: Message }> {
    const parsed = messageIdParamsSchema.safeParse({ id });
    if (!parsed.success) throw parsed.error;
    const data = await this.messages.ack(projectId, parsed.data.id);
    return { data };
  }
}
