"use client";

import { useTranslations } from "next-intl";

import { McpConfigCard } from "@/components/help/mcp-config-card";
import { useProjectContext } from "@/lib/context/project-context";

function buildMcpConfig(projectId: string) {
  return `{
  "mcpServers": {
    "message-bus": {
      "command": "node",
      "args": ["/absolute/path/to/amb/packages/mcp-server/dist/index.js"],
      "env": {
        "MESSAGE_BUS_URL": "http://localhost:3333",
        "MESSAGE_BUS_PROJECT_ID": "${projectId}",
        "MESSAGE_BUS_TOKEN": "<projectToken>"
      }
    }
  }
}`;
}

export function McpConfigCards() {
  const t = useTranslations("Help");
  const { selectedProject } = useProjectContext();
  const projectId = selectedProject?.id ?? "<projectId>";
  const code = buildMcpConfig(projectId);

  return (
    <div className="space-y-3">
      <McpConfigCard
        title="Cursor"
        description={t("singleProjectSetupCursor")}
        code={code}
      />
      <McpConfigCard
        title="Codex"
        description={t("singleProjectSetupCodex")}
        code={code}
      />
      <McpConfigCard
        title="Claude Desktop"
        description={t("singleProjectSetupClaude")}
        code={code}
      />
    </div>
  );
}
