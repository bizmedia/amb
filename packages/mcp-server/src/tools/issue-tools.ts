import type { ArgResolvers } from "../args/arg-resolvers";
import type { MessageBusClient } from "../client/message-bus-client";
import type { ToolArgs, ToolHandler } from "../types/tool-args";

function issuesQueryString(args: ToolArgs): string {
  const params = new URLSearchParams();
  if (typeof args.state === "string") params.set("state", args.state);
  if (typeof args.priority === "string") params.set("priority", args.priority);
  if (typeof args.assignee === "string") params.set("assignee", args.assignee);
  if (typeof args.dueFrom === "string") params.set("dueFrom", args.dueFrom);
  if (typeof args.dueTo === "string") params.set("dueTo", args.dueTo);
  return params.toString();
}

function issueWritableFieldsJson(args: ToolArgs): string {
  return JSON.stringify({
    title: args.title,
    description: args.description,
    state: args.state,
    priority: args.priority,
    assigneeId: args.assigneeId,
    dueDate: args.dueDate,
  });
}

export function createIssueToolHandlers(
  client: MessageBusClient,
  resolvers: ArgResolvers
): Record<string, ToolHandler> {
  const { resolveProjectId, resolveIssueOrTaskId } = resolvers;

  const handleListIssues: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const query = issuesQueryString(args);
    return client.requestJson(
      `/api/projects/${projectId}/issues${query ? `?${query}` : ""}`
    );
  };

  const handleCreateIssue: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    return client.requestJson(`/api/projects/${projectId}/issues`, {
      method: "POST",
      body: issueWritableFieldsJson(args),
    });
  };

  const handleGetIssue: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const id = resolveIssueOrTaskId(args);
    return client.requestJson(`/api/projects/${projectId}/issues/${id}`);
  };

  const handleUpdateIssue: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const id = resolveIssueOrTaskId(args);
    return client.requestJson(`/api/projects/${projectId}/issues/${id}`, {
      method: "PATCH",
      body: issueWritableFieldsJson(args),
    });
  };

  const handleDeleteIssue: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const id = resolveIssueOrTaskId(args);
    return client.requestJson(`/api/projects/${projectId}/issues/${id}`, {
      method: "DELETE",
    });
  };

  const handleMoveIssueState: ToolHandler = async (args) => {
    const projectId = resolveProjectId(args);
    const id = resolveIssueOrTaskId(args);
    return client.requestJson(`/api/projects/${projectId}/issues/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ state: args.state }),
    });
  };

  return {
    list_issues: handleListIssues,
    list_tasks: handleListIssues,
    create_issue: handleCreateIssue,
    create_task: handleCreateIssue,
    get_issue: handleGetIssue,
    get_task: handleGetIssue,
    update_issue: handleUpdateIssue,
    update_task: handleUpdateIssue,
    delete_issue: handleDeleteIssue,
    delete_task: handleDeleteIssue,
    move_issue_state: handleMoveIssueState,
    move_task_state: handleMoveIssueState,
  };
}
