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

/** First project from API list (ordered by `createdAt desc` on the API side). */
function pickPreferredProjectId(
  projects: Array<{ id: string; slug?: string; name: string }>
): string | null {
  return projects[0]?.id ?? null;
}

export async function resolveProjectId(
  request: Request,
  token?: string
): Promise<ProjectContextResult> {
  const rawProjectId = getProjectIdFromRequest(request);
  const client = getApiClient({ token });

  if (!rawProjectId) {
    const projects = await client.listProjects();
    const projectId = pickPreferredProjectId(projects);
    if (!projectId) {
      return {
        projectId: null,
        error: jsonError(404, "project_not_found", "No projects found"),
      };
    }
    return { projectId, error: null };
  }

  const projects = await client.listProjects();
  const parsed = projectIdSchema.safeParse(rawProjectId);
  if (!parsed.success) {
    // Backward compatibility: ignore legacy non-UUID values (e.g. "default")
    // and gracefully fallback to preferred project.
    const projectId = pickPreferredProjectId(projects);
    if (!projectId) {
      return {
        projectId: null,
        error: jsonError(404, "project_not_found", "No projects found"),
      };
    }
    return { projectId, error: null };
  }

  const project = projects.find((p) => p.id === parsed.data);
  if (!project) {
    return {
      projectId: null,
      error: jsonError(404, "project_not_found", "Project not found"),
    };
  }
  return { projectId: project.id, error: null };
}
