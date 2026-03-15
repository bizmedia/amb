import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { projectIdSchema } from "@amb-app/shared";

@Injectable()
export class ProjectParamGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ params?: { projectId?: string }; projectId?: string }>();
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
    request.projectId = project.id;
    return true;
  }
}
