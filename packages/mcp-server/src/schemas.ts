/** Task / issue column states (API IssueState enum). */
export const ISSUE_STATE_ENUM = ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"] as const;

export const ISSUE_PRIORITY_ENUM = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

const THREAD_STATUS_CREATE = ["open", "closed"] as const;
const THREAD_STATUS_UPDATE = ["open", "closed", "archived"] as const;

const PROJECT_ID_PROP = {
  type: "string" as const,
  description: "Project UUID (optional if MESSAGE_BUS_PROJECT_ID is set)",
};

function str(desc: string) {
  return { type: "string" as const, description: desc };
}

function enumString<T extends readonly string[]>(values: T, description: string) {
  return {
    type: "string" as const,
    enum: [...values],
    description,
  };
}

function objectSchema(properties: Record<string, unknown>, required: string[]) {
  return {
    type: "object" as const,
    properties,
    required,
  };
}

const listIssuesQueryProps = {
  projectId: PROJECT_ID_PROP,
  state: enumString(ISSUE_STATE_ENUM, "Filter by state (Kanban column)"),
  priority: enumString(ISSUE_PRIORITY_ENUM, "Filter by priority"),
  assignee: str("Filter by assignee agent UUID"),
  dueFrom: str("Filter by due date from (ISO date or datetime)"),
  dueTo: str("Filter by due date to (ISO date or datetime)"),
};

const createIssueProps = {
  projectId: PROJECT_ID_PROP,
  title: str("Title (required)"),
  description: str("Description"),
  state: enumString(ISSUE_STATE_ENUM, "State"),
  priority: enumString(ISSUE_PRIORITY_ENUM, "Priority"),
  assigneeId: str("Assignee agent UUID (must belong to project)"),
  dueDate: str("Due date (ISO datetime)"),
};

const updateIssueBodyProps = {
  title: str("Title"),
  description: str("Description (nullable)"),
  state: enumString(ISSUE_STATE_ENUM, "State"),
  priority: enumString(ISSUE_PRIORITY_ENUM, "Priority"),
  assigneeId: str("Assignee agent UUID (nullable via null)"),
  dueDate: str("Due date (ISO datetime, nullable via null)"),
};

const threadIdProp = str("Thread UUID");

export const tools = [
  {
    name: "list_project_members",
    description: "List project members (agents in the selected project)",
    inputSchema: objectSchema({ projectId: PROJECT_ID_PROP }, []),
  },
  {
    name: "list_issues",
    description: "List project issues with optional filters",
    inputSchema: objectSchema(listIssuesQueryProps, []),
  },
  {
    name: "create_issue",
    description: "Create a new project issue",
    inputSchema: objectSchema(createIssueProps, ["title"]),
  },
  {
    name: "get_issue",
    description: "Get issue by ID",
    inputSchema: objectSchema(
      {
        projectId: PROJECT_ID_PROP,
        issueId: str("Issue UUID"),
      },
      ["issueId"]
    ),
  },
  {
    name: "update_issue",
    description: "Update issue fields",
    inputSchema: objectSchema(
      {
        projectId: PROJECT_ID_PROP,
        issueId: str("Issue UUID"),
        ...updateIssueBodyProps,
      },
      ["issueId"]
    ),
  },
  {
    name: "move_issue_state",
    description: "Move issue to another state (kanban-style shortcut)",
    inputSchema: objectSchema(
      {
        projectId: PROJECT_ID_PROP,
        issueId: str("Issue UUID"),
        state: enumString(ISSUE_STATE_ENUM, "Target issue state"),
      },
      ["issueId", "state"]
    ),
  },
  {
    name: "delete_issue",
    description: "Delete issue by ID",
    inputSchema: objectSchema(
      {
        projectId: PROJECT_ID_PROP,
        issueId: str("Issue UUID"),
      },
      ["issueId"]
    ),
  },
  {
    name: "list_tasks",
    description:
      "List project tasks (Kanban/issues). Same as list_issues; use for Dashboard «Tasks» workflow.",
    inputSchema: objectSchema(listIssuesQueryProps, []),
  },
  {
    name: "create_task",
    description: "Create a project task (issue on the board)",
    inputSchema: objectSchema(createIssueProps, ["title"]),
  },
  {
    name: "get_task",
    description: "Get a project task by ID",
    inputSchema: objectSchema(
      {
        projectId: PROJECT_ID_PROP,
        taskId: str("Task UUID (same as issue id in API)"),
      },
      ["taskId"]
    ),
  },
  {
    name: "update_task",
    description: "Update task fields (title, state, priority, assignee, due date)",
    inputSchema: objectSchema(
      {
        projectId: PROJECT_ID_PROP,
        taskId: str("Task UUID"),
        ...updateIssueBodyProps,
      },
      ["taskId"]
    ),
  },
  {
    name: "move_task_state",
    description: "Move a task to another column/state (Kanban shortcut)",
    inputSchema: objectSchema(
      {
        projectId: PROJECT_ID_PROP,
        taskId: str("Task UUID"),
        state: enumString(ISSUE_STATE_ENUM, "Target state"),
      },
      ["taskId", "state"]
    ),
  },
  {
    name: "delete_task",
    description: "Delete a project task by ID",
    inputSchema: objectSchema(
      {
        projectId: PROJECT_ID_PROP,
        taskId: str("Task UUID"),
      },
      ["taskId"]
    ),
  },
  {
    name: "list_agents",
    description: "List all registered agents in the message bus",
    inputSchema: objectSchema({}, []),
  },
  {
    name: "register_agent",
    description: "Register a new agent in the message bus",
    inputSchema: objectSchema(
      {
        name: str("Agent name"),
        role: str("Agent role (e.g., dev, qa, po)"),
        capabilities: {
          type: "object",
          description: "Optional capabilities object",
        },
      },
      ["name", "role"]
    ),
  },
  {
    name: "list_threads",
    description: "List all threads in the message bus",
    inputSchema: objectSchema({}, []),
  },
  {
    name: "create_thread",
    description: "Create a new thread for agent communication",
    inputSchema: objectSchema(
      {
        title: str("Thread title"),
        status: enumString(THREAD_STATUS_CREATE, "Thread status (default: open)"),
      },
      ["title"]
    ),
  },
  {
    name: "get_thread_messages",
    description: "Get all messages in a thread",
    inputSchema: objectSchema({ threadId: threadIdProp }, ["threadId"]),
  },
  {
    name: "get_thread",
    description: "Get a thread by ID",
    inputSchema: objectSchema({ threadId: threadIdProp }, ["threadId"]),
  },
  {
    name: "update_thread",
    description: "Update a thread status",
    inputSchema: objectSchema(
      {
        threadId: threadIdProp,
        status: enumString(THREAD_STATUS_UPDATE, "New thread status"),
      },
      ["threadId", "status"]
    ),
  },
  {
    name: "close_thread",
    description: "Close a thread (shortcut for update_thread with status=closed)",
    inputSchema: objectSchema({ threadId: threadIdProp }, ["threadId"]),
  },
  {
    name: "send_message",
    description: "Send a message to a thread",
    inputSchema: objectSchema(
      {
        threadId: threadIdProp,
        fromAgentId: str("Sender agent UUID"),
        toAgentId: str("Recipient agent UUID (optional for broadcast)"),
        payload: {
          type: "object",
          description: "Message payload (any JSON object)",
        },
        parentId: str("Parent message UUID for replies"),
      },
      ["threadId", "fromAgentId", "payload"]
    ),
  },
  {
    name: "get_inbox",
    description: "Get pending messages for an agent",
    inputSchema: objectSchema({ agentId: str("Agent UUID") }, ["agentId"]),
  },
  {
    name: "ack_message",
    description: "Acknowledge a message as received/processed",
    inputSchema: objectSchema({ messageId: str("Message UUID") }, ["messageId"]),
  },
  {
    name: "get_dlq",
    description: "Get messages in the dead letter queue",
    inputSchema: objectSchema({}, []),
  },
];
