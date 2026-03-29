import { ForbiddenException } from "@nestjs/common";
import type { AuthContext } from "./auth-context";

/**
 * When a JWT is present, restrict agent mutations to project tokens (same project)
 * or users with tenant-admin / scoped project-admin.
 * Unauthenticated requests are allowed for legacy e2e / local dev without JWT_REQUIRED.
 */
export function assertAgentWriteAccess(
  auth: AuthContext | undefined,
  projectId: string,
): void {
  if (!auth) {
    return;
  }
  if (auth.subject === "project") {
    if (auth.projectId !== projectId) {
      throw new ForbiddenException(
        "Project token does not match request project context",
      );
    }
    return;
  }
  if (auth.subject === "user") {
    const roles = auth.roles ?? [];
    if (roles.includes("tenant-admin")) {
      return;
    }
    if (roles.includes("project-admin") && auth.projectId === projectId) {
      return;
    }
    throw new ForbiddenException("Insufficient permissions to manage agents");
  }
  throw new ForbiddenException("Insufficient permissions to manage agents");
}

/**
 * Deleting a project is limited to user tokens (not integration project tokens).
 */
export function assertProjectDeleteAccess(
  auth: AuthContext | undefined,
  projectId: string,
  projectTenantId: string | null,
): void {
  if (!auth) {
    return;
  }
  if (auth.subject === "project") {
    throw new ForbiddenException("Project tokens cannot delete projects");
  }
  if (auth.subject !== "user") {
    throw new ForbiddenException("Insufficient permissions to delete project");
  }
  if (!projectTenantId || projectTenantId !== auth.tenantId) {
    throw new ForbiddenException("Project is not in tenant scope");
  }
  const roles = auth.roles ?? [];
  if (roles.includes("tenant-admin")) {
    return;
  }
  if (roles.includes("project-admin") && auth.projectId === projectId) {
    return;
  }
  throw new ForbiddenException("Insufficient permissions to delete project");
}
