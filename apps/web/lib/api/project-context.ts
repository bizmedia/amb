import { jsonError } from "@/lib/api/errors";
import { getApiClient } from "@/lib/api/client";
import { projectIdSchema } from "@amb-app/shared";

function getProjectIdFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("projectId");
  const fromHeader = request.headers.get("x-project-id");
  return fromQuery ?? fromHeader;
}

type ProjectContextResult =
  | { projectId: string; error: null }
  | { projectId: null; error: Response };

export async function resolveProjectId(request: Request): Promise<ProjectContextResult> {
  const rawProjectId = getProjectIdFromRequest(request);
  const client = getApiClient();

  if (!rawProjectId) {
    const projects = await client.listProjects();
    const first = projects[0];
    if (!first) {
      return {
        projectId: null,
        error: jsonError(404, "project_not_found", "No projects found"),
      };
    }
    return { projectId: first.id, error: null };
  }

  const parsed = projectIdSchema.safeParse(rawProjectId);
  if (!parsed.success) {
    return {
      projectId: null,
      error: jsonError(400, "invalid_project_id", "projectId must be a valid UUID"),
    };
  }

  const projects = await client.listProjects();
  const project = projects.find((p) => p.id === parsed.data);
  if (!project) {
    return {
      projectId: null,
      error: jsonError(404, "project_not_found", "Project not found"),
    };
  }
  return { projectId: project.id, error: null };
}
