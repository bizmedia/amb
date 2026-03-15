import { createClient } from "@amb-app/sdk";

const API_BASE = process.env.API_URL ?? "http://localhost:3334";

/**
 * Server-side API client for calling Nest API (apps/api).
 * Use in Next.js API routes and server components.
 */
export function getApiClient(projectId?: string) {
  return createClient({
    baseUrl: API_BASE,
    projectId,
  });
}
