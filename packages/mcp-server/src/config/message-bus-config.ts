export type MessageBusConfig = {
  baseUrl: string;
  /** Заголовок x-project-id по умолчанию (MESSAGE_BUS_PROJECT_ID). */
  defaultProjectId?: string;
};

export function getMessageBusConfig(): MessageBusConfig {
  const baseUrl = process.env.MESSAGE_BUS_URL || "http://localhost:3333";
  const defaultProjectId = process.env.MESSAGE_BUS_PROJECT_ID;
  return {
    baseUrl,
    ...(defaultProjectId ? { defaultProjectId } : {}),
  };
}
