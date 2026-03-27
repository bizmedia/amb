/**
 * Agent Message Bus TypeScript SDK
 */

import type {
  Agent,
  Thread,
  Message,
  Project,
  Tenant,
  ProjectToken,
  ProjectTokenIssueResult,
  Task,
  Epic,
  EpicDetail,
  EpicListItem,
  ApiResponse,
  CreateAgentInput,
  UpdateAgentInput,
  CreateThreadInput,
  SendMessageInput,
  MessageBusConfig,
  PollOptions,
  UpdateThreadInput,
  WaitForResponseOptions,
  CreateProjectInput,
  UpdateProjectInput,
  CreateProjectTokenInput,
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
  CreateEpicInput,
  UpdateEpicInput,
  ListEpicsQuery,
  CreateSprintInput,
  UpdateSprintInput,
  ListSprintsQuery,
  Sprint,
  SprintListItem,
  SprintDetail,
} from "./types";

export class MessageBusClient {
  private baseUrl: string;
  private timeout: number;
  private projectId?: string;
  private token?: string;

  constructor(config: MessageBusConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.timeout = config.timeout ?? 10000;
    this.projectId = config.projectId;
    this.token = config.token;
  }

  setToken(token?: string | null): void {
    this.token = token ?? undefined;
  }

  getToken(): string | undefined {
    return this.token;
  }

  setProjectId(projectId?: string | null): void {
    this.projectId = projectId ?? undefined;
  }

  getProjectId(): string | undefined {
    return this.projectId;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (this.projectId) headers["x-project-id"] = this.projectId;
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const codeFromBody = (error as { error?: { code?: string } }).error?.code;
        const fallbackCode =
          response.status === 401
            ? "unauthorized"
            : response.status === 403
              ? "forbidden"
              : "http_error";
        throw new MessageBusError(
          (error as { error?: { message?: string } }).error?.message ??
            `HTTP ${response.status}`,
          codeFromBody ?? fallbackCode,
          response.status,
          (error as { error?: { details?: unknown } }).error?.details
        );
      }

      return response.json() as Promise<T>;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async registerAgent(input: CreateAgentInput): Promise<Agent> {
    const res = await this.fetch<ApiResponse<Agent>>("/api/agents", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  }

  async listAgents(): Promise<Agent[]> {
    const res = await this.fetch<ApiResponse<Agent[]>>("/api/agents");
    return res.data;
  }

  async getAgent(agentId: string): Promise<Agent> {
    const res = await this.fetch<ApiResponse<Agent>>(`/api/agents/${agentId}`);
    return res.data;
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.fetch<ApiResponse<{ success: true }>>(`/api/agents/${agentId}`, {
      method: "DELETE",
    });
  }

  async updateAgent(agentId: string, input: UpdateAgentInput): Promise<Agent> {
    const res = await this.fetch<ApiResponse<Agent>>(`/api/agents/${agentId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return res.data;
  }

  async searchAgents(query: string): Promise<Agent[]> {
    const res = await this.fetch<ApiResponse<Agent[]>>(
      `/api/agents/search?q=${encodeURIComponent(query)}`
    );
    return res.data;
  }

  async createThread(input: CreateThreadInput): Promise<Thread> {
    const res = await this.fetch<ApiResponse<Thread>>("/api/threads", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  }

  async listThreads(): Promise<Thread[]> {
    const res = await this.fetch<ApiResponse<Thread[]>>("/api/threads");
    return res.data;
  }

  async getThreadMessages(threadId: string): Promise<Message[]> {
    const res = await this.fetch<ApiResponse<Message[]>>(
      `/api/threads/${threadId}/messages`
    );
    return res.data;
  }

  async getThread(threadId: string): Promise<Thread> {
    const res = await this.fetch<ApiResponse<Thread>>(
      `/api/threads/${threadId}`
    );
    return res.data;
  }

  async updateThread(
    threadId: string,
    input: UpdateThreadInput
  ): Promise<Thread> {
    const res = await this.fetch<ApiResponse<Thread>>(
      `/api/threads/${threadId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  async deleteThread(threadId: string): Promise<void> {
    await this.fetch<ApiResponse<{ success: true }>>(
      `/api/threads/${threadId}`,
      { method: "DELETE" }
    );
  }

  async closeThread(threadId: string): Promise<Thread> {
    return this.updateThread(threadId, { status: "closed" });
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const res = await this.fetch<ApiResponse<Message>>("/api/messages/send", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  }

  async ackMessage(messageId: string): Promise<Message> {
    const res = await this.fetch<ApiResponse<Message>>(
      `/api/messages/${messageId}/ack`,
      { method: "POST" }
    );
    return res.data;
  }

  async getInbox(agentId: string): Promise<Message[]> {
    const res = await this.fetch<ApiResponse<Message[]>>(
      `/api/messages/inbox?agentId=${agentId}`
    );
    return res.data;
  }

  async *pollInbox(
    agentId: string,
    options: PollOptions = {}
  ): AsyncGenerator<Message[], void, unknown> {
    const interval = options.interval ?? 3000;
    const signal = options.signal;

    while (!signal?.aborted) {
      const messages = await this.getInbox(agentId);
      if (messages.length > 0) {
        yield messages;
      }
      await this.sleep(interval, signal);
    }
  }

  private sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      signal?.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new Error("Aborted"));
      });
    });
  }

  async waitForResponse(
    threadId: string,
    fromAgentId: string,
    afterMessageId: string,
    options: WaitForResponseOptions = {}
  ): Promise<Message | null> {
    const timeout = options.timeout ?? 60000;
    const pollInterval = options.pollInterval ?? 2000;
    const signal = options.signal;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (signal?.aborted) return null;

      const messages = await this.getThreadMessages(threadId);
      let foundAfter = false;
      for (const msg of messages) {
        if (msg.id === afterMessageId) {
          foundAfter = true;
          continue;
        }
        if (foundAfter && msg.fromAgentId === fromAgentId) {
          return msg;
        }
      }

      await this.sleep(pollInterval, signal);
    }

    return null;
  }

  async sendAndWait(
    input: SendMessageInput & { toAgentId: string },
    options: WaitForResponseOptions = {}
  ): Promise<{ sent: Message; response: Message | null }> {
    const sent = await this.sendMessage(input);
    const response = await this.waitForResponse(
      input.threadId,
      input.toAgentId,
      sent.id,
      options
    );
    return { sent, response };
  }

  async getDLQ(): Promise<Message[]> {
    const res = await this.fetch<ApiResponse<Message[]>>("/api/dlq");
    return res.data;
  }

  async retryDLQMessage(messageId: string): Promise<Message> {
    const res = await this.fetch<ApiResponse<Message>>(
      `/api/dlq/${messageId}/retry`,
      { method: "POST" }
    );
    return res.data;
  }

  async retryAllDLQ(): Promise<{ count: number }> {
    const res = await this.fetch<ApiResponse<{ count: number }>>(
      "/api/dlq/retry-all",
      { method: "POST" }
    );
    return res.data;
  }

  async listProjects(): Promise<Project[]> {
    const res = await this.fetch<ApiResponse<Project[]>>("/api/projects");
    return res.data;
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    const res = await this.fetch<ApiResponse<Project>>("/api/projects", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  }

  async updateProject(projectId: string, input: UpdateProjectInput): Promise<Project> {
    const res = await this.fetch<ApiResponse<Project>>(`/api/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return res.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.fetch<ApiResponse<{ success: true }>>(`/api/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  async listTenants(): Promise<Tenant[]> {
    const res = await this.fetch<ApiResponse<Tenant[]>>("/api/tenants");
    return res.data;
  }

  async listProjectTokens(projectId: string): Promise<ProjectToken[]> {
    const res = await this.fetch<ApiResponse<ProjectToken[]>>(
      `/api/admin/projects/${projectId}/tokens`
    );
    return res.data;
  }

  async createProjectToken(
    projectId: string,
    input: CreateProjectTokenInput
  ): Promise<ProjectTokenIssueResult> {
    const res = await this.fetch<ApiResponse<ProjectTokenIssueResult>>(
      `/api/admin/projects/${projectId}/tokens`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  async revokeProjectToken(projectId: string, tokenId: string): Promise<ProjectToken> {
    const res = await this.fetch<ApiResponse<ProjectToken>>(
      `/api/admin/projects/${projectId}/tokens/${tokenId}/revoke`,
      { method: "POST" }
    );
    return res.data;
  }

  async listTasks(
    projectId: string,
    query?: ListTasksQuery
  ): Promise<Task[]> {
    const params = new URLSearchParams();
    if (query?.state) params.set("state", query.state);
    if (query?.priority) params.set("priority", query.priority);
    if (query?.assignee) params.set("assignee", query.assignee);
    if (query?.epicId) params.set("epicId", query.epicId);
    if (query?.sprintId) params.set("sprintId", query.sprintId);
    if (query?.key) params.set("key", query.key);
    if (query?.search) params.set("search", query.search);
    if (query?.dueFrom) params.set("dueFrom", String(query.dueFrom));
    if (query?.dueTo) params.set("dueTo", String(query.dueTo));
    const qs = params.toString();
    const res = await this.fetch<ApiResponse<Task[]>>(
      `/api/projects/${projectId}/tasks${qs ? `?${qs}` : ""}`
    );
    return res.data;
  }

  async createTask(projectId: string, input: CreateTaskInput): Promise<Task> {
    const res = await this.fetch<ApiResponse<Task>>(
      `/api/projects/${projectId}/tasks`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  async getTask(projectId: string, taskIdOrKey: string): Promise<Task> {
    const res = await this.fetch<ApiResponse<Task>>(
      `/api/projects/${projectId}/tasks/${encodeURIComponent(taskIdOrKey)}`
    );
    return res.data;
  }

  async updateTask(
    projectId: string,
    taskIdOrKey: string,
    input: UpdateTaskInput
  ): Promise<Task> {
    const res = await this.fetch<ApiResponse<Task>>(
      `/api/projects/${projectId}/tasks/${encodeURIComponent(taskIdOrKey)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  async deleteTask(projectId: string, taskIdOrKey: string): Promise<void> {
    await this.fetch<ApiResponse<{ success: true }>>(
      `/api/projects/${projectId}/tasks/${encodeURIComponent(taskIdOrKey)}`,
      { method: "DELETE" }
    );
  }

  private async listEpics(
    projectId: string,
    query?: ListEpicsQuery
  ): Promise<EpicListItem[]> {
    const params = new URLSearchParams();
    if (query?.status) params.set("status", query.status);
    const qs = params.toString();
    const res = await this.fetch<ApiResponse<EpicListItem[]>>(
      `/api/projects/${projectId}/epics${qs ? `?${qs}` : ""}`
    );
    return res.data;
  }

  private async getEpic(
    projectId: string,
    epicId: string
  ): Promise<EpicDetail> {
    const res = await this.fetch<ApiResponse<EpicDetail>>(
      `/api/projects/${projectId}/epics/${encodeURIComponent(epicId)}`
    );
    return res.data;
  }

  private async createEpic(
    projectId: string,
    input: CreateEpicInput
  ): Promise<Epic> {
    const res = await this.fetch<ApiResponse<Epic>>(
      `/api/projects/${projectId}/epics`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  private async updateEpic(
    projectId: string,
    epicId: string,
    input: UpdateEpicInput
  ): Promise<Epic> {
    const res = await this.fetch<ApiResponse<Epic>>(
      `/api/projects/${projectId}/epics/${encodeURIComponent(epicId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  private async deleteEpic(
    projectId: string,
    epicId: string
  ): Promise<Epic> {
    const res = await this.fetch<ApiResponse<Epic>>(
      `/api/projects/${projectId}/epics/${encodeURIComponent(epicId)}`,
      { method: "DELETE" }
    );
    return res.data;
  }

  readonly epics = {
    list: (projectId: string, query?: ListEpicsQuery) =>
      this.listEpics(projectId, query),
    get: (projectId: string, epicId: string) =>
      this.getEpic(projectId, epicId),
    create: (projectId: string, input: CreateEpicInput) =>
      this.createEpic(projectId, input),
    update: (projectId: string, epicId: string, input: UpdateEpicInput) =>
      this.updateEpic(projectId, epicId, input),
    delete: (projectId: string, epicId: string) =>
      this.deleteEpic(projectId, epicId),
  };

  private async listSprints(
    projectId: string,
    query?: ListSprintsQuery
  ): Promise<SprintListItem[]> {
    const params = new URLSearchParams();
    if (query?.status) params.set("status", query.status);
    const qs = params.toString();
    const res = await this.fetch<ApiResponse<SprintListItem[]>>(
      `/api/projects/${projectId}/sprints${qs ? `?${qs}` : ""}`
    );
    return res.data;
  }

  private async getSprint(projectId: string, sprintId: string): Promise<SprintDetail> {
    const res = await this.fetch<ApiResponse<SprintDetail>>(
      `/api/projects/${projectId}/sprints/${encodeURIComponent(sprintId)}`
    );
    return res.data;
  }

  private async createSprint(projectId: string, input: CreateSprintInput): Promise<Sprint> {
    const res = await this.fetch<ApiResponse<Sprint>>(
      `/api/projects/${projectId}/sprints`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  private async updateSprint(
    projectId: string,
    sprintId: string,
    input: UpdateSprintInput
  ): Promise<Sprint> {
    const res = await this.fetch<ApiResponse<Sprint>>(
      `/api/projects/${projectId}/sprints/${encodeURIComponent(sprintId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  private async deleteSprint(projectId: string, sprintId: string): Promise<void> {
    await this.fetch<ApiResponse<{ success: true }>>(
      `/api/projects/${projectId}/sprints/${encodeURIComponent(sprintId)}`,
      { method: "DELETE" }
    );
  }

  private async startSprint(projectId: string, sprintId: string): Promise<Sprint> {
    const res = await this.fetch<ApiResponse<Sprint>>(
      `/api/projects/${projectId}/sprints/${encodeURIComponent(sprintId)}/start`,
      { method: "POST" }
    );
    return res.data;
  }

  private async completeSprint(projectId: string, sprintId: string): Promise<Sprint> {
    const res = await this.fetch<ApiResponse<Sprint>>(
      `/api/projects/${projectId}/sprints/${encodeURIComponent(sprintId)}/complete`,
      { method: "POST" }
    );
    return res.data;
  }

  readonly sprints = {
    list: (projectId: string, query?: ListSprintsQuery) =>
      this.listSprints(projectId, query),
    get: (projectId: string, sprintId: string) => this.getSprint(projectId, sprintId),
    create: (projectId: string, input: CreateSprintInput) =>
      this.createSprint(projectId, input),
    update: (projectId: string, sprintId: string, input: UpdateSprintInput) =>
      this.updateSprint(projectId, sprintId, input),
    delete: (projectId: string, sprintId: string) => this.deleteSprint(projectId, sprintId),
    start: (projectId: string, sprintId: string) => this.startSprint(projectId, sprintId),
    complete: (projectId: string, sprintId: string) => this.completeSprint(projectId, sprintId),
  };

  readonly tasks = {
    list: (projectId: string, query?: ListTasksQuery) =>
      this.listTasks(projectId, query),
  };
}

export class MessageBusError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "MessageBusError";
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.code === "unauthorized";
  }

  get isForbidden(): boolean {
    return this.status === 403 || this.code === "forbidden";
  }

  get isAuthError(): boolean {
    return this.isUnauthorized || this.isForbidden;
  }
}

export interface CreateClientOptions {
  baseUrl?: string;
  token?: string;
  projectId?: string;
  timeout?: number;
}

/**
 * Create SDK client. Supports JWT/token for vNext auth.
 * @example createClient({ baseUrl: "http://localhost:3333", token: "…" })
 */
export function createClient(
  options: string | CreateClientOptions = "http://localhost:3333"
): MessageBusClient {
  const config: MessageBusConfig =
    typeof options === "string"
      ? { baseUrl: options }
      : {
          baseUrl: options.baseUrl ?? "http://localhost:3333",
          token: options.token,
          projectId: options.projectId,
          timeout: options.timeout,
        };
  return new MessageBusClient(config);
}

export * from "./types";
