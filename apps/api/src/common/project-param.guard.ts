import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { projectIdSchema } from "@amb-app/shared";
import type { RequestWithAuth } from "./auth-context";

@Injectable()
export class ProjectParamGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const raw = request.params?.projectId;
    if (!raw) return true;

    const parsed = projectIdSchema.safeParse(raw);
    if (!parsed.success) {
      throw new BadRequestException("projectId must be a valid UUID");
    }

    const project = await this.prisma.project.findUnique({
      where: { id: parsed.data },
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    if (request.auth?.projectId && request.auth.projectId !== project.id) {
      throw new BadRequestException("projectId mismatch between JWT claims and route params");
    }

    if (
      request.auth?.tenantId &&
      (!project.tenantId || project.tenantId !== request.auth.tenantId)
    ) {
      throw new NotFoundException("Project not found");
    }

    request.projectId = project.id;
    return true;
  }
}
