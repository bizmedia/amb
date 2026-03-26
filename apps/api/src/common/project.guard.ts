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
export class ProjectGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const fromQuery = request.query?.projectId;
    const fromHeaderRaw = request.headers["x-project-id"];
    const fromHeader = Array.isArray(fromHeaderRaw)
      ? fromHeaderRaw[0]
      : fromHeaderRaw;

    if (fromQuery && fromHeader && fromQuery !== fromHeader) {
      throw new BadRequestException("projectId mismatch between query and x-project-id header");
    }

    const tokenProjectId = request.auth?.projectId;
    const tokenTenantId = request.auth?.tenantId;

    if (tokenProjectId) {
      const raw = fromQuery ?? fromHeader;
      if (raw && raw !== tokenProjectId) {
        throw new BadRequestException("projectId mismatch between JWT claims and request");
      }

      const project = await this.prisma.project.findUnique({
        where: { id: tokenProjectId },
      });
      if (!project) {
        throw new NotFoundException("Project not found");
      }
      if (!project.tenantId || project.tenantId !== tokenTenantId) {
        throw new NotFoundException("Project not found");
      }

      request.projectId = project.id;
      return true;
    }

    const raw = fromQuery ?? fromHeader;

    if (!raw) {
      throw new BadRequestException(
        "Missing project context: pass projectId as a query parameter or x-project-id header"
      );
    }

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
    if (tokenTenantId && (!project.tenantId || project.tenantId !== tokenTenantId)) {
      throw new NotFoundException("Project not found");
    }
    request.projectId = project.id;
    return true;
  }
}
