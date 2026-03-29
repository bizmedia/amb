import { loadProjectEnv } from "../load-project-env";

export type MessageBusConfig = {
  baseUrl: string;
  /** Заголовок x-project-id по умолчанию (MESSAGE_BUS_PROJECT_ID). */
  defaultProjectId?: string;
  /** Authorization: Bearer … при JWT_REQUIRED или project/user token. */
  accessToken?: string;
};

export function getMessageBusConfig(): MessageBusConfig {
  loadProjectEnv();
  const baseUrl = process.env.MESSAGE_BUS_URL || "http://localhost:3333";
  const defaultProjectId = process.env.MESSAGE_BUS_PROJECT_ID;
  const accessToken =
    process.env.MESSAGE_BUS_ACCESS_TOKEN?.trim() ||
    process.env.MESSAGE_BUS_TOKEN?.trim() ||
    undefined;
  return {
    baseUrl,
    ...(defaultProjectId ? { defaultProjectId } : {}),
    ...(accessToken ? { accessToken } : {}),
  };
}
