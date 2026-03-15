/**
 * Agent Message Bus SDK Types
 * Entity types from shared; API/transport types defined here.
 */

import type { Agent, Message, Thread, Issue } from "@amb-app/shared";

export type { Agent, Thread, Message, Issue };

export interface Project {
  id: string;
  tenantId?: string | null;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CreateProjectInput {
  name: string;
}

export interface UpdateProjectInput {
  name: string;
}

export interface ProjectToken {
  id: string;
  name: string;
  issuedBy: string | null;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
}

export interface ProjectTokenIssueResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  claims: {
    sub: string;
    tenantId: string;
    projectId: string;
    type: string;
    jti: string;
  };
}

export interface CreateProjectTokenInput {
  name: string;
  expiresIn?: number;
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
