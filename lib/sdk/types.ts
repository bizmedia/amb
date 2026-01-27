/**
 * Agent Message Bus SDK Types
 */

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
  capabilities: unknown;
  createdAt: string;
  lastSeen: string | null;
}

export interface Thread {
  id: string;
  title: string;
  status: "open" | "closed" | "archived";
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  fromAgentId: string;
  toAgentId: string | null;
  payload: unknown;
  status: "pending" | "delivered" | "ack" | "failed" | "dlq";
  retries: number;
  parentId: string | null;
  createdAt: string;
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
