import type { ToolArgs } from "../types/tool-args";

type AgentLike = {
  id?: string;
  name?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ThreadLike = {
  id?: string;
  title?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type MessageLike = {
  id?: string;
  threadId?: string;
  fromAgentId?: string | null;
  toAgentId?: string | null;
  payload?: unknown;
  status?: string;
  retryCount?: number;
  parentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type TaskLike = {
  id?: string;
  key?: string;
  title?: string;
  state?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  updatedAt?: string;
};

type EpicLike = {
  id?: string;
  title?: string;
  status?: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { tasks?: number };
  tasks?: unknown;
};

type SprintLike = {
  id?: string;
  name?: string;
  status?: string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { tasks?: number };
  tasks?: unknown;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function previewPayload(payload: unknown): string | null {
  if (payload == null) return null;
  if (typeof payload === "string") return payload.slice(0, 160);

  const record = asRecord(payload);
  if (!record) return JSON.stringify(payload).slice(0, 160);

  for (const key of ["text", "task", "message", "summary", "title", "content"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.slice(0, 160);
    }
  }

  return JSON.stringify(record).slice(0, 160);
}

export function getLimit(args: ToolArgs): number {
  const raw = args.limit;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.max(1, Math.min(MAX_LIMIT, Math.trunc(raw)));
  }
  if (typeof raw === "string" && raw.trim()) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return Math.max(1, Math.min(MAX_LIMIT, Math.trunc(parsed)));
    }
  }
  return DEFAULT_LIMIT;
}

export function isSummaryMode(args: ToolArgs, defaultValue = true): boolean {
  const raw = args.summary;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    if (raw === "true") return true;
    if (raw === "false") return false;
  }
  return defaultValue;
}

export function shapeAgents(agents: AgentLike[], args: ToolArgs) {
  const limited = agents.slice(0, getLimit(args));
  if (!isSummaryMode(args)) return limited;

  return limited.map((agent) => ({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    status: agent.status,
    updatedAt: agent.updatedAt ?? agent.createdAt,
  }));
}

export function shapeThreads(threads: ThreadLike[], args: ToolArgs) {
  const limited = threads.slice(0, getLimit(args));
  if (!isSummaryMode(args)) return limited;

  return limited.map((thread) => ({
    id: thread.id,
    title: thread.title,
    status: thread.status,
    updatedAt: thread.updatedAt ?? thread.createdAt,
  }));
}

export function shapeMessages(messages: MessageLike[], args: ToolArgs) {
  const limited = messages.slice(0, getLimit(args));
  if (!isSummaryMode(args)) return limited;

  return limited.map((message) => ({
    id: message.id,
    threadId: message.threadId,
    fromAgentId: message.fromAgentId,
    toAgentId: message.toAgentId,
    status: message.status,
    retryCount: message.retryCount,
    parentId: message.parentId,
    preview: previewPayload(message.payload),
    createdAt: message.createdAt,
  }));
}

export function shapeTasks(tasks: TaskLike[], args: ToolArgs) {
  const limited = tasks.slice(0, getLimit(args));
  if (!isSummaryMode(args)) return limited;

  return limited.map((task) => ({
    id: task.id,
    key: task.key,
    title: task.title,
    state: task.state,
    priority: task.priority,
    assigneeId: task.assigneeId,
    dueDate: task.dueDate,
    updatedAt: task.updatedAt,
  }));
}

export function shapeEpics(epics: EpicLike[], args: ToolArgs) {
  const limited = epics.slice(0, getLimit(args));
  if (!isSummaryMode(args)) return limited;

  return limited.map((epic) => ({
    id: epic.id,
    title: epic.title,
    status: epic.status,
    taskCount: epic._count?.tasks,
    updatedAt: epic.updatedAt ?? epic.createdAt,
  }));
}

export function shapeEpicDetail(epic: Record<string, unknown>, args: ToolArgs) {
  if (!isSummaryMode(args)) return epic;

  const e = epic as EpicLike;
  const tasks = (Array.isArray(epic.tasks) ? epic.tasks : []) as TaskLike[];
  const limitedTasks = tasks.slice(0, getLimit(args));

  return {
    id: e.id,
    title: e.title,
    status: e.status,
    description:
      typeof e.description === "string"
        ? e.description.length > 240
          ? `${e.description.slice(0, 240)}…`
          : e.description
        : e.description,
    taskCount: e._count?.tasks ?? tasks.length,
    tasks: limitedTasks.map((t) => ({
      id: t.id,
      key: t.key,
      title: t.title,
      state: t.state,
    })),
    updatedAt: e.updatedAt ?? e.createdAt,
  };
}

export function shapeSprints(sprints: SprintLike[], args: ToolArgs) {
  const limited = sprints.slice(0, getLimit(args));
  if (!isSummaryMode(args)) return limited;

  return limited.map((sprint) => ({
    id: sprint.id,
    name: sprint.name,
    status: sprint.status,
    taskCount: sprint._count?.tasks,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    updatedAt: sprint.updatedAt ?? sprint.createdAt,
  }));
}

export function shapeSprintDetail(sprint: Record<string, unknown>, args: ToolArgs) {
  if (!isSummaryMode(args)) return sprint;

  const s = sprint as SprintLike;
  const tasks = (Array.isArray(sprint.tasks) ? sprint.tasks : []) as TaskLike[];
  const limitedTasks = tasks.slice(0, getLimit(args));

  return {
    id: s.id,
    name: s.name,
    status: s.status,
    goal:
      typeof s.goal === "string"
        ? s.goal.length > 240
          ? `${s.goal.slice(0, 240)}…`
          : s.goal
        : s.goal,
    startDate: s.startDate,
    endDate: s.endDate,
    taskCount: s._count?.tasks ?? tasks.length,
    tasks: limitedTasks.map((t) => ({
      id: t.id,
      key: t.key,
      title: t.title,
      state: t.state,
    })),
    updatedAt: s.updatedAt ?? s.createdAt,
  };
}
