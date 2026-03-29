import type { ArgResolvers } from "../args/arg-resolvers";
import type { MessageBusClient } from "../client/message-bus-client";
import type { ToolArgs, ToolHandler } from "../types/tool-args";
import { shapeTasks } from "./response-shaping";

function tasksQueryString(args: ToolArgs): string {
  const params = new URLSearchParams();
  if (typeof args.state === "string") params.set("state", args.state);
  if (typeof args.priority === "string") params.set("priority", args.priority);
  if (typeof args.assignee === "string") params.set("assignee", args.assignee);
  if (typeof args.key === "string") params.set("key", args.key);
  if (typeof args.search === "string") params.set("search", args.search);
  if (typeof args.dueFrom === "string") params.set("dueFrom", args.dueFrom);
  if (typeof args.dueTo === "string") params.set("dueTo", args.dueTo);
  return params.toString();
}

function taskWritableFieldsJson(args: ToolArgs): string {
  const body: Record<string, unknown> = {
    title: args.title,
    description: args.description,
    state: args.state,
    priority: args.priority,
    assigneeId: args.assigneeId,
    dueDate: args.dueDate,
    epicId: args.epicId,
    sprintId: args.sprintId,
  };
  return JSON.stringify(body);
}

export function createTaskToolHandlers(
  client: MessageBusClient,
  resolvers: ArgResolvers
): Record<string, ToolHandler> {
  const { resolveProjectId, resolveTaskId } = resolvers;

  const handleListTasks: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const query = tasksQueryString(args);
    const tasks = await client.requestJson(
      `/api/projects/${projectId}/tasks${query ? `?${query}` : ""}`
    );
    return shapeTasks(tasks as Array<Record<string, unknown>>, args);
  };

  const handleCreateTask: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    return client.requestJson(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      body: taskWritableFieldsJson(args),
    });
  };

  const handleGetTask: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const id = resolveTaskId(args);
    return client.requestJson(
      `/api/projects/${projectId}/tasks/${encodeURIComponent(id)}`
    );
  };

  const handleUpdateTask: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const id = resolveTaskId(args);
    return client.requestJson(
      `/api/projects/${projectId}/tasks/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: taskWritableFieldsJson(args),
      }
    );
  };

  const handleDeleteTask: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const id = resolveTaskId(args);
    return client.requestJson(
      `/api/projects/${projectId}/tasks/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
  };

  const handleMoveTaskState: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const id = resolveTaskId(args);
    return client.requestJson(
      `/api/projects/${projectId}/tasks/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ state: args.state }),
      }
    );
  };

  return {
    list_issues: handleListTasks,
    list_tasks: handleListTasks,
    create_issue: handleCreateTask,
    create_task: handleCreateTask,
    get_issue: handleGetTask,
    get_task: handleGetTask,
    update_issue: handleUpdateTask,
    update_task: handleUpdateTask,
    delete_issue: handleDeleteTask,
    delete_task: handleDeleteTask,
    move_issue_state: handleMoveTaskState,
    move_task_state: handleMoveTaskState,
  };
}
