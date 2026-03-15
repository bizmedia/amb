import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ProjectIdParam = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ projectId?: string; params?: { projectId?: string } }>();
    return request.projectId ?? request.params?.projectId!;
  }
);
