import { Body, Controller, HttpCode, Post, Req } from "@nestjs/common";
import { issueProjectTokenSchema, loginSchema } from "@amb-app/shared";
import { AuthService } from "./auth.service";
import { Public } from "../common/public.decorator";
import type { RequestWithAuth } from "../common/auth-context";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(
    @Body() body: unknown
  ): Promise<{
    data: {
      accessToken: string;
      tokenType: string;
      expiresIn: number;
      user: {
        id: string;
        email: string;
        displayName: string | null;
        tenantId: string;
        roles: string[];
      };
    };
  }> {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw parsed.error;
    }

    const data = await this.authService.login(parsed.data.email, parsed.data.password);
    return { data };
  }

  @Post("project-tokens")
  @HttpCode(201)
  async issueProjectToken(
    @Req() req: RequestWithAuth,
    @Body() body: unknown
  ): Promise<{
    data: {
      accessToken: string;
      tokenType: string;
      expiresIn: number;
      claims: {
        sub: string;
        tenantId: string;
        projectId: string;
        type: string;
        jti: string;
      };
    };
  }> {
    const parsed = issueProjectTokenSchema.safeParse(body);
    if (!parsed.success) {
      throw parsed.error;
    }

    const data = await this.authService.issueProjectToken(
      req.auth,
      parsed.data.projectId,
      parsed.data.expiresIn
    );
    return { data };
  }
}
