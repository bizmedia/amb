export type AuthContext = {
  subject: string;
  userId?: string;
  tenantId: string;
  projectId?: string;
  roles?: string[];
  tokenType?: string;
  issuedAt?: number;
  expiresAt?: number;
};

export type RequestWithAuth = {
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | undefined>;
  params?: { projectId?: string };
  auth?: AuthContext;
  projectId?: string;
  traceId?: string;
  spanId?: string;
};
