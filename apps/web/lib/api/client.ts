import { createClient } from "@amb-app/sdk";

export const API_BASE_URL = process.env.API_URL ?? "http://localhost:3334";

type GetApiClientOptions = {
  projectId?: string;
  token?: string;
};

/**
 * Server-side API client for calling Nest API (apps/api).
 * Use in Next.js API routes and server components.
 */
export function getApiClient(options: GetApiClientOptions = {}) {
  return createClient({
    baseUrl: API_BASE_URL,
    projectId: options.projectId,
    token: options.token,
  });
}
