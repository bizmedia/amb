import type { Agent, Message, Thread } from "@amb-app/shared";

/** Input for creating an agent inside a project scope. */
export type CreateAgentInput = {
  /** Target project ID. */
  projectId: string;
  /** Human-readable unique name inside the project. */
  name: string;
  /** Agent role (for example: architect, dev, qa). */
  role: string;
  /** Optional machine-readable capabilities payload. */
  capabilities?: unknown;
};

/** Input for creating a thread in a project. */
export type CreateThreadInput = {
  /** Target project ID. */
  projectId: string;
  /** Thread title shown in UI and APIs. */
  title: string;
  /** Initial thread status. */
  status: "open" | "closed";
};

/** Input for creating a message in a thread. */
export type SendMessageInput = {
  /** Target project ID. */
  projectId: string;
  /** Parent thread ID. */
  threadId: string;
  /** Sender agent ID. */
  fromAgentId: string;
  /** Receiver agent ID. `null/undefined` means broadcast/system message. */
  toAgentId?: string | null;
  /** Arbitrary message payload. */
  payload: unknown;
  /** Optional parent message for reply chain. */
  parentId?: string | null;
};

/**
 * Persistence contract for message bus use-cases.
 * Implementations are responsible for project-level isolation and data consistency.
 */
export interface MessageBusStorage {
  // Agents
  /** Return all agents for a project. */
  listAgents(projectId: string): Promise<Agent[]>;
  /** Create an agent in project scope. */
  createAgent(input: CreateAgentInput): Promise<Agent>;
  /** Search agents by free-text query (name/role/capabilities implementation-defined). */
  searchAgents(projectId: string, query: string): Promise<Agent[]>;
  /** Return agent by id or `null` when not found. */
  getAgentById(projectId: string, agentId: string): Promise<Agent | null>;

  // Threads
  /** Return all threads for a project. */
  listThreads(projectId: string): Promise<Thread[]>;
  /** Create a thread in project scope. */
  createThread(input: CreateThreadInput): Promise<Thread>;
  /** Return thread by id or `null` when not found. */
  getThreadById(projectId: string, threadId: string): Promise<Thread | null>;
  /** Return all messages belonging to a thread. */
  listThreadMessages(projectId: string, threadId: string): Promise<Message[]>;
  /** Update thread status and return updated entity. */
  updateThreadStatus(
    projectId: string,
    threadId: string,
    status: "open" | "closed" | "archived"
  ): Promise<Thread>;
  /** Delete a thread and associated relations according to storage policy. */
  deleteThread(projectId: string, threadId: string): Promise<void>;

  // Messages
  /** Create a message entity in storage. */
  createMessage(data: {
    /** Target project ID. */
    projectId: string;
    /** Parent thread ID. */
    threadId: string;
    /** Sender agent ID. */
    fromAgentId: string;
    /** Receiver agent ID (`null` for broadcast/system message). */
    toAgentId: string | null;
    /** Arbitrary serialized payload. */
    payload: unknown;
    /** Optional parent message ID. */
    parentId: string | null;
    /** Current delivery state. */
    status: string;
    /** Retry counter. */
    retries: number;
  }): Promise<Message>;
  /** Return message by id or `null` when not found. */
  getMessageById(projectId: string, messageId: string): Promise<Message | null>;
  /** Update message status (and optionally retries) and return updated entity. */
  updateMessageStatus(
    projectId: string,
    messageId: string,
    status: string,
    retries?: number
  ): Promise<Message>;
  /** Find messages by partial filter criteria. */
  findMessages(projectId: string, filter: {
    /** Match by status. */
    status?: string;
    /** Match by receiver agent id (`null` allowed). */
    toAgentId?: string | null;
    /** Exclude messages from the specified sender id. */
    fromAgentId?: { not: string };
    /** Match messages created before timestamp. */
    createdAtLt?: Date;
  }): Promise<Message[]>;
  /** Mark pending messages for agent as delivered and return delivered (unacked) messages for agent. */
  getInboxAndMarkDelivered(projectId: string, agentId: string): Promise<Message[]>;
  /** Bulk update message fields by filter and return number of affected rows. */
  updateManyMessages(
    projectId: string,
    filter: { status: string; toAgentId?: string | null; fromAgentId?: { not: string } },
    data: { status: string }
  ): Promise<number>;
  /** Bulk delete messages by filter and return number of deleted rows. */
  deleteManyMessages(projectId: string, filter: {
    status: { in: string[] };
    createdAtLt: Date;
  }): Promise<number>;
  /** Bulk move messages to another status and return number of affected rows. */
  updateManyMessagesToStatus(
    projectId: string,
    filter: { status: string },
    data: { status: string; retries?: number }
  ): Promise<number>;
}
