/** Аргументы MCP-инструмента (сырой JSON-объект от клиента). */
export type ToolArgs = Record<string, unknown>;

export type ToolHandler = (args: ToolArgs) => Promise<unknown>;
