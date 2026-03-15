import { jsonError } from "@/lib/api/errors";
import { getApiClient } from "@/lib/api/client";
import { projectIdSchema } from "@amb-app/shared";

type ProjectParamResult =
  | { projectId: string; error: null }
  | { projectId: null; error: Response };

export async function resolveProjectIdParam(
  rawProjectId: string,
  token?: string
): Promise<ProjectParamResult> {
  const parsed = projectIdSchema.safeParse(rawProjectId);
  if (!parsed.success) {
    return {
      projectId: null,
      error: jsonError(400, "invalid_project_id", "projectId must be a valid UUID"),
    };
  }

  const client = getApiClient({ token });
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
