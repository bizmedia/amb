import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ProjectId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ projectId?: string }>();
    return request.projectId!;
  }
);
