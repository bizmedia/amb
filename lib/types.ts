export type Agent = {
  id: string;
  name: string;
  role: string;
  status: string;
  capabilities: unknown;
  createdAt: string;
  lastSeen: string | null;
};

export type Thread = {
  id: string;
  title: string;
  status: "open" | "closed" | "archived";
  createdAt: string;
};

export type Message = {
  id: string;
  threadId: string;
  fromAgentId: string;
  toAgentId: string | null;
  payload: unknown;
  status: string;
  retries: number;
  parentId: string | null;
  createdAt: string;
};
