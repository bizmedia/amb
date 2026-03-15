import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req } from "@nestjs/common";
import { adminIssueProjectTokenSchema, projectTokenParamsSchema } from "@amb-app/shared";
import type { RequestWithAuth } from "../common/auth-context";
import { AuthService } from "./auth.service";

@Controller("admin/projects/:projectId/tokens")
export class ProjectTokensAdminController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async list(@Req() req: RequestWithAuth, @Param("projectId") projectId: string) {
    const data = await this.authService.listProjectTokens(req.auth, projectId);
    return { data };
  }

  @Post()
  @HttpCode(201)
  async create(
    @Req() req: RequestWithAuth,
    @Param("projectId") projectId: string,
    @Body() body: unknown
  ) {
    const parsedBody = adminIssueProjectTokenSchema.safeParse(body);
    if (!parsedBody.success) throw parsedBody.error;

    const data = await this.authService.issueProjectToken(
      req.auth,
      projectId,
      parsedBody.data.name,
      parsedBody.data.expiresIn
    );
    return { data };
  }

  @Post(":tokenId/revoke")
  async revoke(
    @Req() req: RequestWithAuth,
    @Param() params: Record<string, string>
  ) {
    const parsedParams = projectTokenParamsSchema.safeParse({
      projectId: params.projectId,
      tokenId: params.tokenId,
    });
    if (!parsedParams.success) throw parsedParams.error;

    const data = await this.authService.revokeProjectToken(
      req.auth,
      parsedParams.data.projectId,
      parsedParams.data.tokenId
    );
    return { data };
  }

  @Get(":tokenId/audit")
  async listAudit(
    @Req() req: RequestWithAuth,
    @Param() params: Record<string, string>
  ) {
    const parsedParams = projectTokenParamsSchema.safeParse({
      projectId: params.projectId,
      tokenId: params.tokenId,
    });
    if (!parsedParams.success) throw parsedParams.error;

    const data = await this.authService.listProjectTokenAudit(
      req.auth,
      parsedParams.data.projectId,
      parsedParams.data.tokenId
    );
    return { data };
  }

  @Delete(":tokenId")
  async delete(
    @Req() req: RequestWithAuth,
    @Param() params: Record<string, string>
  ) {
    const parsedParams = projectTokenParamsSchema.safeParse({
      projectId: params.projectId,
      tokenId: params.tokenId,
    });
    if (!parsedParams.success) throw parsedParams.error;

    const data = await this.authService.deleteProjectToken(
      req.auth,
      parsedParams.data.projectId,
      parsedParams.data.tokenId
    );
    return { data };
  }
}
