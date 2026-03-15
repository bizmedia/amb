/**
 * Agent Message Bus SDK Types
 * Entity types from shared; API/transport types defined here.
 */

import type { Agent, Message, Thread, Issue } from "@amb-app/shared";

export type { Agent, Thread, Message, Issue };

export interface Project {
  id: string;
  name: string;
  slug: string;
}

export interface CreateProjectInput {
  name: string;
}

export interface CreateIssueInput {
  title: string;
  description?: string | null;
  state?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: Date | string | null;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string | null;
  state?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: Date | string | null;
}

export interface ListIssuesQuery {
  state?: string;
  priority?: string;
  assignee?: string;
  dueFrom?: Date | string;
  dueTo?: Date | string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface CreateAgentInput {
  name: string;
  role: string;
  capabilities?: unknown;
}

export interface CreateThreadInput {
  title: string;
  status?: "open" | "closed";
}

export interface SendMessageInput {
  threadId: string;
  fromAgentId: string;
  toAgentId?: string | null;
  payload: unknown;
  parentId?: string | null;
}

export interface MessageBusConfig {
  baseUrl: string;
  timeout?: number;
  projectId?: string;
  /** JWT or API token for auth (vNext) */
  token?: string;
}

export interface PollOptions {
  interval?: number;
  signal?: AbortSignal;
}

export interface UpdateThreadInput {
  status: "open" | "closed" | "archived";
}

export interface WaitForResponseOptions {
  timeout?: number;
  pollInterval?: number;
  signal?: AbortSignal;
}
