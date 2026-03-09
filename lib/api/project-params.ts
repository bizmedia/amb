import { z } from "zod";

import { jsonError } from "@/lib/api/errors";
import { getProjectById } from "@/lib/services/projects";

const projectIdSchema = z.string().uuid();

type ProjectParamResult =
  | { projectId: string; error: null }
  | { projectId: null; error: Response };

export async function resolveProjectIdParam(rawProjectId: string): Promise<ProjectParamResult> {
  const parsed = projectIdSchema.safeParse(rawProjectId);
  if (!parsed.success) {
    return {
      projectId: null,
      error: jsonError(400, "invalid_project_id", "projectId must be a valid UUID"),
    };
  }

  try {
    const project = await getProjectById(parsed.data);
    return { projectId: project.id, error: null };
  } catch {
    return {
      projectId: null,
      error: jsonError(404, "project_not_found", "Project not found"),
    };
  }
}
