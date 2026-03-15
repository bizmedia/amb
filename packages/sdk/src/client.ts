/**
 * Agent Message Bus TypeScript SDK
 */

import type {
  Agent,
  Thread,
  Message,
  Project,
  Issue,
  ApiResponse,
  CreateAgentInput,
  CreateThreadInput,
  SendMessageInput,
  MessageBusConfig,
  PollOptions,
  UpdateThreadInput,
  WaitForResponseOptions,
  CreateProjectInput,
  CreateIssueInput,
  UpdateIssueInput,
  ListIssuesQuery,
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
        throw new MessageBusError(
          (error as { error?: { message?: string } }).error?.message ??
            `HTTP ${response.status}`,
          (error as { error?: { code?: string } }).error?.code ?? "http_error",
          response.status
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

  async listIssues(
    projectId: string,
    query?: ListIssuesQuery
  ): Promise<Issue[]> {
    const params = new URLSearchParams();
    if (query?.state) params.set("state", query.state);
    if (query?.priority) params.set("priority", query.priority);
    if (query?.assignee) params.set("assignee", query.assignee);
    if (query?.dueFrom) params.set("dueFrom", String(query.dueFrom));
    if (query?.dueTo) params.set("dueTo", String(query.dueTo));
    const qs = params.toString();
    const res = await this.fetch<ApiResponse<Issue[]>>(
      `/api/projects/${projectId}/issues${qs ? `?${qs}` : ""}`
    );
    return res.data;
  }

  async createIssue(projectId: string, input: CreateIssueInput): Promise<Issue> {
    const res = await this.fetch<ApiResponse<Issue>>(
      `/api/projects/${projectId}/issues`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  async getIssue(projectId: string, issueId: string): Promise<Issue> {
    const res = await this.fetch<ApiResponse<Issue>>(
      `/api/projects/${projectId}/issues/${issueId}`
    );
    return res.data;
  }

  async updateIssue(
    projectId: string,
    issueId: string,
    input: UpdateIssueInput
  ): Promise<Issue> {
    const res = await this.fetch<ApiResponse<Issue>>(
      `/api/projects/${projectId}/issues/${issueId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  async deleteIssue(projectId: string, issueId: string): Promise<void> {
    await this.fetch<ApiResponse<{ success: true }>>(
      `/api/projects/${projectId}/issues/${issueId}`,
      { method: "DELETE" }
    );
  }
}

export class MessageBusError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = "MessageBusError";
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
