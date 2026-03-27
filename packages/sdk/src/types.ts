/**
 * Agent Message Bus SDK Types
 * Entity types from shared; API/transport types defined here.
 */

import type {
  Agent,
  Epic,
  EpicStatus,
  Message,
  Sprint,
  SprintStatus,
  Task,
  TaskAssignee,
  TaskEpic,
  TaskPriority,
  TaskSprint,
  TaskState,
  Thread,
} from "@amb-app/shared";

export type {
  Agent,
  Epic,
  EpicStatus,
  Message,
  Sprint,
  SprintStatus,
  Task,
  TaskAssignee,
  TaskEpic,
  TaskSprint,
  Thread,
};

/** Task rows nested under `EpicDetail.tasks` (list select from API). */
export type EpicLinkedTask = {
  id: string;
  key: string | null;
  title: string;
  state: TaskState;
  priority: TaskPriority;
  assignee: TaskAssignee | null;
  sprint: TaskSprint | null;
  createdAt: string;
  updatedAt: string;
};

/** `GET .../epics` — опционально `_count.tasks` с бэкенда. */
export type EpicListItem = Epic & {
  _count?: { tasks: number };
};

/** `GET .../epics/:id` — эпик с задачами и счётчиком. */
export type EpicDetail = Epic & {
  _count: { tasks: number };
  tasks: EpicLinkedTask[];
};

export interface Project {
  id: string;
  tenantId?: string | null;
  name: string;
  slug: string;
  taskPrefix?: string | null;
  taskSequence?: number;
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
  taskPrefix?: string;
}

export interface UpdateProjectInput {
  name?: string;
  taskPrefix?: string;
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

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  state?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: Date | string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  state?: string;
  priority?: string;
  assigneeId?: string | null;
  epicId?: string | null;
  sprintId?: string | null;
  dueDate?: Date | string | null;
}

export interface ListTasksQuery {
  state?: string;
  priority?: string;
  assignee?: string;
  epicId?: string;
  sprintId?: string;
  key?: string;
  search?: string;
  dueFrom?: Date | string;
  dueTo?: Date | string;
}

export interface CreateEpicInput {
  title: string;
  description?: string | null;
  status?: EpicStatus;
}

export interface UpdateEpicInput {
  title?: string;
  description?: string | null;
  status?: EpicStatus;
}

export interface ListEpicsQuery {
  status?: EpicStatus;
}

export type SprintListItem = Sprint & {
  _count?: { tasks: number };
};

export type SprintLinkedTask = {
  id: string;
  key: string | null;
  title: string;
  state: TaskState;
  priority: TaskPriority;
  assignee: TaskAssignee | null;
  epic: TaskEpic | null;
  createdAt: string;
  updatedAt: string;
};

export type SprintDetail = Sprint & {
  _count: { tasks: number };
  tasks: SprintLinkedTask[];
};

export interface CreateSprintInput {
  name: string;
  goal?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

export interface UpdateSprintInput {
  name?: string;
  goal?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  status?: SprintStatus;
}

export interface ListSprintsQuery {
  status?: SprintStatus;
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

export interface UpdateAgentInput {
  name?: string;
  role?: string;
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
