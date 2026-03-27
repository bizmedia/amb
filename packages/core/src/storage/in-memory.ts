import type { Agent, Message, Thread } from "@amb-app/shared";
import type {
  CreateAgentInput,
  CreateThreadInput,
  MessageBusStorage,
} from "./interface";

/** Generate random entity id for in-memory records. */
function uuid(): string {
  return crypto.randomUUID();
}

/** Return current timestamp in ISO format. */
function now(): string {
  return new Date().toISOString();
}

/**
 * In-memory implementation of `MessageBusStorage`.
 * Intended for tests, examples and local development without external DB.
 */
export class InMemoryMessageBusStorage implements MessageBusStorage {
  private agents: Agent[] = [];
  private threads: Thread[] = [];
  private messages: Message[] = [];

  /** @inheritdoc */
  async listAgents(projectId: string): Promise<Agent[]> {
    return this.agents
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /** @inheritdoc */
  async createAgent(input: CreateAgentInput): Promise<Agent> {
    const agent: Agent = {
      id: uuid(),
      projectId: input.projectId,
      name: input.name,
      role: input.role,
      status: "online",
      capabilities: input.capabilities ?? null,
      createdAt: now(),
      lastSeen: null,
    };
    this.agents.push(agent);
    return agent;
  }

  /** @inheritdoc */
  async searchAgents(projectId: string, query: string): Promise<Agent[]> {
    if (!query) return this.listAgents(projectId);
    const q = query.toLowerCase();
    return this.agents
      .filter(
        (a) =>
          a.projectId === projectId &&
          (a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /** @inheritdoc */
  async getAgentById(projectId: string, agentId: string): Promise<Agent | null> {
    return this.agents.find((a) => a.projectId === projectId && a.id === agentId) ?? null;
  }

  /** @inheritdoc */
  async listThreads(projectId: string): Promise<Thread[]> {
    return this.threads
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /** @inheritdoc */
  async createThread(input: CreateThreadInput): Promise<Thread> {
    const thread: Thread = {
      id: uuid(),
      projectId: input.projectId,
      title: input.title,
      status: input.status,
      createdAt: now(),
    };
    this.threads.push(thread);
    return thread;
  }

  /** @inheritdoc */
  async getThreadById(projectId: string, threadId: string): Promise<Thread | null> {
    return this.threads.find((t) => t.projectId === projectId && t.id === threadId) ?? null;
  }

  /** @inheritdoc */
  async listThreadMessages(projectId: string, threadId: string): Promise<Message[]> {
    return this.messages
      .filter((m) => m.projectId === projectId && m.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  /** @inheritdoc */
  async updateThreadStatus(
    projectId: string,
    threadId: string,
    status: "open" | "closed" | "archived"
  ): Promise<Thread> {
    const i = this.threads.findIndex((t) => t.projectId === projectId && t.id === threadId);
    if (i === -1) throw new Error("Thread not found");
    this.threads[i] = { ...this.threads[i], status };
    return this.threads[i];
  }

  /** @inheritdoc */
  async deleteThread(projectId: string, threadId: string): Promise<void> {
    this.messages = this.messages.filter(
      (m) => !(m.projectId === projectId && m.threadId === threadId)
    );
    this.threads = this.threads.filter(
      (t) => !(t.projectId === projectId && t.id === threadId)
    );
  }

  /** @inheritdoc */
  async createMessage(data: {
    projectId: string;
    threadId: string;
    fromAgentId: string;
    toAgentId: string | null;
    payload: unknown;
    parentId: string | null;
    status: string;
    retries: number;
  }): Promise<Message> {
    const message: Message = {
      id: uuid(),
      projectId: data.projectId,
      threadId: data.threadId,
      fromAgentId: data.fromAgentId,
      toAgentId: data.toAgentId,
      payload: data.payload,
      status: data.status,
      retries: data.retries,
      parentId: data.parentId,
      createdAt: now(),
    };
    this.messages.push(message);
    return message;
  }

  /** @inheritdoc */
  async getMessageById(projectId: string, messageId: string): Promise<Message | null> {
    return this.messages.find((m) => m.projectId === projectId && m.id === messageId) ?? null;
  }

  /** @inheritdoc */
  async updateMessageStatus(
    projectId: string,
    messageId: string,
    status: string,
    retries?: number
  ): Promise<Message> {
    const i = this.messages.findIndex((m) => m.projectId === projectId && m.id === messageId);
    if (i === -1) throw new Error("Message not found");
    this.messages[i] = {
      ...this.messages[i],
      status,
      ...(retries !== undefined ? { retries } : {}),
    };
    return this.messages[i];
  }

  /**
   * Mark matching pending messages as delivered and return delivered messages visible to agent.
   * Visibility includes direct (`toAgentId === agentId`) and broadcast (`toAgentId === null`) messages.
   */
  async getInboxAndMarkDelivered(projectId: string, agentId: string): Promise<Message[]> {
    for (let i = 0; i < this.messages.length; i++) {
      const m = this.messages[i];
      if (
        m.projectId !== projectId ||
        m.status !== "pending" ||
        m.fromAgentId === agentId
      )
        continue;
      if (m.toAgentId !== null && m.toAgentId !== agentId) continue;
      this.messages[i] = { ...m, status: "delivered" };
    }
    return this.findMessages(projectId, {
      status: "delivered",
      fromAgentId: { not: agentId },
    }).then((list) =>
      list.filter((m) => m.toAgentId === agentId || m.toAgentId === null)
    );
  }

  /** @inheritdoc */
  async findMessages(
    projectId: string,
    filter: {
      status?: string;
      toAgentId?: string | null;
      fromAgentId?: { not: string };
      createdAtLt?: Date;
    }
  ): Promise<Message[]> {
    let list = this.messages.filter((m) => m.projectId === projectId);
    if (filter.status !== undefined) list = list.filter((m) => m.status === filter.status);
    if (filter.toAgentId !== undefined) {
      if (filter.toAgentId === null) list = list.filter((m) => m.toAgentId === null);
      else list = list.filter((m) => m.toAgentId === filter.toAgentId);
    }
    if (filter.fromAgentId?.not)
      list = list.filter((m) => m.fromAgentId !== filter.fromAgentId!.not);
    if (filter.createdAtLt)
      list = list.filter((m) => new Date(m.createdAt) < filter.createdAtLt!);
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  /** @inheritdoc */
  async updateManyMessages(
    projectId: string,
    filter: {
      status: string;
      toAgentId?: string | null;
      fromAgentId?: { not: string };
    },
    data: { status: string }
  ): Promise<number> {
    let count = 0;
    for (let i = 0; i < this.messages.length; i++) {
      const m = this.messages[i];
      if (m.projectId !== projectId || m.status !== filter.status) continue;
      if (filter.toAgentId !== undefined) {
        if (filter.toAgentId === null && m.toAgentId !== null) continue;
        if (filter.toAgentId !== null && m.toAgentId !== filter.toAgentId) continue;
      }
      if (filter.fromAgentId?.not && m.fromAgentId === filter.fromAgentId.not) continue;
      this.messages[i] = { ...m, status: data.status };
      count++;
    }
    return count;
  }

  /** @inheritdoc */
  async deleteManyMessages(
    projectId: string,
    filter: { status: { in: string[] }; createdAtLt: Date }
  ): Promise<number> {
    const before = this.messages.length;
    this.messages = this.messages.filter((m) => {
      if (m.projectId !== projectId) return true;
      if (!filter.status.in.includes(m.status)) return true;
      if (new Date(m.createdAt) >= filter.createdAtLt) return true;
      return false;
    });
    return before - this.messages.length;
  }

  /** @inheritdoc */
  async updateManyMessagesToStatus(
    projectId: string,
    filter: { status: string },
    data: { status: string; retries?: number }
  ): Promise<number> {
    let count = 0;
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].projectId !== projectId || this.messages[i].status !== filter.status)
        continue;
      this.messages[i] = {
        ...this.messages[i],
        status: data.status,
        ...(data.retries !== undefined ? { retries: data.retries } : {}),
      };
      count++;
    }
    return count;
  }
}
