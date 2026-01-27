/**
 * Agent Message Bus TypeScript SDK
 */

import type {
  Agent,
  Thread,
  Message,
  ApiResponse,
  CreateAgentInput,
  CreateThreadInput,
  SendMessageInput,
  MessageBusConfig,
  PollOptions,
  UpdateThreadInput,
  WaitForResponseOptions,
} from "./types";

export class MessageBusClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: MessageBusConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.timeout = config.timeout ?? 10000;
  }

  private async fetch<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new MessageBusError(
          error.error?.message ?? `HTTP ${response.status}`,
          error.error?.code ?? "http_error",
          response.status
        );
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Agents
  // ─────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────
  // Threads
  // ─────────────────────────────────────────────────────────────

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

  async updateThread(threadId: string, input: UpdateThreadInput): Promise<Thread> {
    const res = await this.fetch<ApiResponse<Thread>>(
      `/api/threads/${threadId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  }

  async closeThread(threadId: string): Promise<Thread> {
    return this.updateThread(threadId, { status: "closed" });
  }

  // ─────────────────────────────────────────────────────────────
  // Messages
  // ─────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────
  // Inbox
  // ─────────────────────────────────────────────────────────────

  async getInbox(agentId: string): Promise<Message[]> {
    const res = await this.fetch<ApiResponse<Message[]>>(
      `/api/messages/inbox?agentId=${agentId}`
    );
    return res.data;
  }

  /**
   * Poll inbox for new messages
   */
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

  /**
   * Wait for a response message in a thread from a specific agent
   */
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
      
      // Find message from target agent after our message
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

  /**
   * Send message and wait for response
   */
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

  // ─────────────────────────────────────────────────────────────
  // DLQ
  // ─────────────────────────────────────────────────────────────

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

// Default client for localhost
export function createClient(baseUrl = "http://localhost:3333"): MessageBusClient {
  return new MessageBusClient({ baseUrl });
}

export * from "./types";
