import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { projectIdSchema } from "@amb-app/shared";

const DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_SLUG = "default";

@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string>;
      query: Record<string, string>;
      projectId?: string;
    }>();
    const fromQuery = request.query?.projectId;
    const fromHeader = request.headers["x-project-id"];
    const raw = fromQuery ?? fromHeader;

    if (!raw) {
      const project = await this.prisma.project.upsert({
        where: { slug: DEFAULT_SLUG },
        update: {},
        create: {
          id: DEFAULT_PROJECT_ID,
          name: "Default Project",
          slug: DEFAULT_SLUG,
        },
      });
      request.projectId = project.id;
      return true;
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
    request.projectId = project.id;
    return true;
  }
}
