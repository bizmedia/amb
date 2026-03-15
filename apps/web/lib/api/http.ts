type ApiEnvelope<T> = {
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export class ApiHttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string = "http_error",
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}

export function isAuthError(error: unknown): boolean {
  return (
    error instanceof ApiHttpError &&
    (error.status === 401 || error.status === 403 || error.code === "unauthorized")
  );
}

export async function fetchApiData<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    throw new ApiHttpError(
      json?.error?.message ?? `Request failed with HTTP ${response.status}`,
      response.status,
      json?.error?.code ?? "http_error",
      json?.error?.details
    );
  }

  return (json?.data ?? null) as T;
}
