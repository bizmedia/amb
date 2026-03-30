import type { ArgResolvers } from "../args/arg-resolvers";
import type { MessageBusClient } from "../client/message-bus-client";
import type { ToolArgs, ToolHandler } from "../types/tool-args";
import { shapeEpicDetail, shapeEpics } from "./response-shaping";

function epicsQueryString(args: ToolArgs): string {
  const params = new URLSearchParams();
  if (typeof args.status === "string") params.set("status", args.status);
  return params.toString();
}

function epicCreateBodyJson(args: ToolArgs): string {
  return JSON.stringify({
    title: args.title,
    description: args.description,
    status: args.status,
  });
}

function epicUpdateBodyJson(args: ToolArgs): string {
  const body: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(args, "title")) body.title = args.title;
  if (Object.prototype.hasOwnProperty.call(args, "description")) body.description = args.description;
  if (Object.prototype.hasOwnProperty.call(args, "status")) body.status = args.status;
  return JSON.stringify(body);
}

export function createEpicToolHandlers(
  client: MessageBusClient,
  resolvers: ArgResolvers
): Record<string, ToolHandler> {
  const { resolveProjectId } = resolvers;

  const handleListEpics: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const query = epicsQueryString(args);
    const epics = await client.requestJson(
      `/api/projects/${projectId}/epics${query ? `?${query}` : ""}`
    );
    return shapeEpics(epics as Array<Record<string, unknown>>, args);
  };

  const handleCreateEpic: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    return client.requestJson(`/api/projects/${projectId}/epics`, {
      method: "POST",
      body: epicCreateBodyJson(args),
    });
  };

  const handleGetEpic: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const epicId = String(args.epicId ?? "").trim();
    if (!epicId) throw new Error("epicId is required");
    const epic = await client.requestJson(
      `/api/projects/${projectId}/epics/${encodeURIComponent(epicId)}`
    );
    return shapeEpicDetail(epic as Record<string, unknown>, args);
  };

  const handleUpdateEpic: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const epicId = String(args.epicId ?? "").trim();
    if (!epicId) throw new Error("epicId is required");
    return client.requestJson(`/api/projects/${projectId}/epics/${encodeURIComponent(epicId)}`, {
      method: "PATCH",
      body: epicUpdateBodyJson(args),
    });
  };

  const handleArchiveEpic: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const epicId = String(args.epicId ?? "").trim();
    if (!epicId) throw new Error("epicId is required");
    return client.requestJson(`/api/projects/${projectId}/epics/${encodeURIComponent(epicId)}`, {
      method: "DELETE",
    });
  };

  return {
    list_epics: handleListEpics,
    create_epic: handleCreateEpic,
    get_epic: handleGetEpic,
    update_epic: handleUpdateEpic,
    archive_epic: handleArchiveEpic,
  };
}
