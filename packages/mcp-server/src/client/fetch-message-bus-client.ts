import type { MessageBusConfig } from "../config/message-bus-config";
import type { MessageBusClient } from "./message-bus-client";

export function createFetchMessageBusClient(config: MessageBusConfig): MessageBusClient {
  const { baseUrl, defaultProjectId } = config;

  return {
    async requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(defaultProjectId ? { "x-project-id": defaultProjectId } : {}),
          ...init.headers,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
      }

      const json = (await response.json()) as { data: T };
      return json.data;
    },
  };
}
