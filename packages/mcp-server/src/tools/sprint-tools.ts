import type { ArgResolvers } from "../args/arg-resolvers";
import type { MessageBusClient } from "../client/message-bus-client";
import type { ToolArgs, ToolHandler } from "../types/tool-args";
import { shapeSprintDetail, shapeSprints } from "./response-shaping";

function sprintsQueryString(args: ToolArgs): string {
  const params = new URLSearchParams();
  if (typeof args.status === "string") params.set("status", args.status);
  return params.toString();
}

function sprintCreateBodyJson(args: ToolArgs): string {
  return JSON.stringify({
    name: args.name,
    goal: args.goal,
    startDate: args.startDate,
    endDate: args.endDate,
  });
}

function sprintUpdateBodyJson(args: ToolArgs): string {
  const body: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(args, "name")) body.name = args.name;
  if (Object.prototype.hasOwnProperty.call(args, "goal")) body.goal = args.goal;
  if (Object.prototype.hasOwnProperty.call(args, "startDate")) body.startDate = args.startDate;
  if (Object.prototype.hasOwnProperty.call(args, "endDate")) body.endDate = args.endDate;
  if (Object.prototype.hasOwnProperty.call(args, "status")) body.status = args.status;
  return JSON.stringify(body);
}

export function createSprintToolHandlers(
  client: MessageBusClient,
  resolvers: ArgResolvers
): Record<string, ToolHandler> {
  const { resolveProjectId } = resolvers;

  const sprintPath = (projectId: string, sprintId: string, suffix = "") =>
    `/api/projects/${projectId}/sprints/${encodeURIComponent(sprintId)}${suffix}`;

  const handleListSprints: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const query = sprintsQueryString(args);
    const sprints = await client.requestJson(
      `/api/projects/${projectId}/sprints${query ? `?${query}` : ""}`
    );
    return shapeSprints(sprints as Array<Record<string, unknown>>, args);
  };

  const handleCreateSprint: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    return client.requestJson(`/api/projects/${projectId}/sprints`, {
      method: "POST",
      body: sprintCreateBodyJson(args),
    });
  };

  const handleGetSprint: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const sprintId = String(args.sprintId ?? "").trim();
    if (!sprintId) throw new Error("sprintId is required");
    const sprint = await client.requestJson(sprintPath(projectId, sprintId));
    return shapeSprintDetail(sprint as Record<string, unknown>, args);
  };

  const handleUpdateSprint: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const sprintId = String(args.sprintId ?? "").trim();
    if (!sprintId) throw new Error("sprintId is required");
    return client.requestJson(sprintPath(projectId, sprintId), {
      method: "PATCH",
      body: sprintUpdateBodyJson(args),
    });
  };

  const handleStartSprint: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const sprintId = String(args.sprintId ?? "").trim();
    if (!sprintId) throw new Error("sprintId is required");
    return client.requestJson(sprintPath(projectId, sprintId, "/start"), {
      method: "POST",
      body: "{}",
    });
  };

  const handleCompleteSprint: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const sprintId = String(args.sprintId ?? "").trim();
    if (!sprintId) throw new Error("sprintId is required");
    return client.requestJson(sprintPath(projectId, sprintId, "/complete"), {
      method: "POST",
      body: "{}",
    });
  };

  const handleDeleteSprint: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const sprintId = String(args.sprintId ?? "").trim();
    if (!sprintId) throw new Error("sprintId is required");
    return client.requestJson(sprintPath(projectId, sprintId), { method: "DELETE" });
  };

  return {
    list_sprints: handleListSprints,
    create_sprint: handleCreateSprint,
    get_sprint: handleGetSprint,
    update_sprint: handleUpdateSprint,
    start_sprint: handleStartSprint,
    complete_sprint: handleCompleteSprint,
    delete_sprint: handleDeleteSprint,
  };
}
