/**
 * Agent Message Bus SDK Types
 * Entity types from shared; API/transport types defined here.
 */

import type { Agent, Message, Thread } from "@amb-app/shared";

export type { Agent, Thread, Message };

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
