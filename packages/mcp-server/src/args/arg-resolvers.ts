import type { ToolArgs } from "../types/tool-args";

export type ArgResolvers = {
  resolveProjectId(args: ToolArgs): string;
  resolveTaskId(args: ToolArgs): string;
};

export function createArgResolvers(defaultProjectId?: string): ArgResolvers {
  return {
    resolveProjectId(args: ToolArgs): string {
      const projectId =
        typeof args.projectId === "string" && args.projectId.trim().length > 0
          ? args.projectId
          : defaultProjectId;

      if (!projectId) {
        throw new Error(
          "projectId is required. Provide it in tool arguments or set MESSAGE_BUS_PROJECT_ID."
        );
      }

      return projectId;
    },

    resolveTaskId(args: ToolArgs): string {
      const fromTask =
        typeof args.taskId === "string" && args.taskId.trim().length > 0
          ? args.taskId.trim()
          : "";
      const fromIssue =
        typeof args.issueId === "string" && args.issueId.trim().length > 0
          ? args.issueId.trim()
          : "";
      const id = fromTask || fromIssue;
      if (!id) {
        throw new Error("taskId or issueId (legacy) is required");
      }
      return id;
    },
  };
}
