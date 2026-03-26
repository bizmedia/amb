import type { ToolArgs } from "../types/tool-args";

type CallToolRequest = {
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
};

type CallToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

/**
 * Адаптер MCP CallTool → доменный вызов инструмента.
 * Не знает про HTTP и шину — только сериализация ответа (SRP).
 */
export function createMcpCallToolExecutor(
  executeTool: (name: string, args: ToolArgs) => Promise<unknown>
): (request: CallToolRequest) => Promise<CallToolResult> {
  return async (request) => {
    const { name, arguments: rawArgs } = request.params;
    try {
      const result = await executeTool(name, (rawArgs as ToolArgs) || {});
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  };
}
