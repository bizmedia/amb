import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

export type SeedMessageBusConfig = {
  baseUrl: string;
  projectId?: string;
  accessToken?: string;
  sources: {
    baseUrl: string;
    projectId: string;
    accessToken: string;
  };
};

type McpEnvVars = {
  MESSAGE_BUS_URL?: string;
  MESSAGE_BUS_PROJECT_ID?: string;
  MESSAGE_BUS_ACCESS_TOKEN?: string;
  MESSAGE_BUS_TOKEN?: string;
};

type McpJsonFile = {
  mcpServers?: Record<
    string,
    { env?: Record<string, string | undefined> }
  >;
};

function parseLenientJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(raw.replace(/,\s*([\]}])/g, "$1"));
  }
}

function repoRoot(): string {
  const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(scriptsDir, "..", "..", "..");
}

// ── Extract env from a JSON MCP config (Cursor / Claude Code) ───────────

function mcpEnvVarsMeaningful(v: McpEnvVars): boolean {
  return Boolean(
    v.MESSAGE_BUS_URL?.trim() ||
      v.MESSAGE_BUS_PROJECT_ID?.trim() ||
      v.MESSAGE_BUS_ACCESS_TOKEN?.trim() ||
      v.MESSAGE_BUS_TOKEN?.trim()
  );
}

function extractEnvFromMcpJson(parsed: McpJsonFile): McpEnvVars | null {
  const servers = parsed.mcpServers;
  if (!servers || typeof servers !== "object") return null;

  const preferred = servers["message-bus"]?.env ?? servers["project-0-amb-app-message-bus"]?.env;
  if (preferred && typeof preferred === "object") {
    const v = pickVars(preferred);
    return mcpEnvVarsMeaningful(v) ? v : null;
  }

  for (const server of Object.values(servers)) {
    const env = server?.env;
    if (!env || typeof env !== "object") continue;
    if (env.MESSAGE_BUS_PROJECT_ID?.trim() || env.MESSAGE_BUS_URL?.trim()) {
      const v = pickVars(env);
      if (mcpEnvVarsMeaningful(v)) return v;
    }
  }

  return null;
}

function pickVars(env: Record<string, string | undefined>): McpEnvVars {
  return {
    MESSAGE_BUS_URL: env.MESSAGE_BUS_URL?.trim() || undefined,
    MESSAGE_BUS_PROJECT_ID: env.MESSAGE_BUS_PROJECT_ID?.trim() || undefined,
    MESSAGE_BUS_ACCESS_TOKEN: env.MESSAGE_BUS_ACCESS_TOKEN?.trim() || undefined,
    MESSAGE_BUS_TOKEN: env.MESSAGE_BUS_TOKEN?.trim() || undefined,
  };
}

async function readJsonMcpFile(filePath: string): Promise<{ vars: McpEnvVars; file: string } | null> {
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
  try {
    const parsed = parseLenientJson(raw) as McpJsonFile;
    const vars = extractEnvFromMcpJson(parsed);
    return vars ? { vars, file: filePath } : null;
  } catch {
    return null;
  }
}

// ── Extract env from TOML config (.codex/config.toml) ──────────────────

function parseTomlMessageBusEnv(raw: string): McpEnvVars | null {
  const sectionRe = /\[mcp_servers\.[^\]]*message[_-]?bus[^\]]*\.env\]/i;
  const sectionMatch = sectionRe.exec(raw);
  if (!sectionMatch) return null;

  const afterSection = raw.slice(sectionMatch.index + sectionMatch[0].length);
  const nextSection = afterSection.indexOf("\n[");
  const block = nextSection === -1 ? afterSection : afterSection.slice(0, nextSection);

  const vars: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^\s*([\w]+)\s*=\s*"([^"]*)"/);
    if (m && m[1] && m[2] !== undefined) {
      vars[m[1]] = m[2];
    }
  }

  if (!vars.MESSAGE_BUS_URL && !vars.MESSAGE_BUS_PROJECT_ID) return null;

  return {
    MESSAGE_BUS_URL: vars.MESSAGE_BUS_URL?.trim() || undefined,
    MESSAGE_BUS_PROJECT_ID: vars.MESSAGE_BUS_PROJECT_ID?.trim() || undefined,
    MESSAGE_BUS_ACCESS_TOKEN: vars.MESSAGE_BUS_ACCESS_TOKEN?.trim() || undefined,
    MESSAGE_BUS_TOKEN: vars.MESSAGE_BUS_TOKEN?.trim() || undefined,
  };
}

async function readTomlMcpFile(filePath: string): Promise<{ vars: McpEnvVars; file: string } | null> {
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
  const vars = parseTomlMessageBusEnv(raw);
  return vars ? { vars, file: filePath } : null;
}

/** Простой разбор .env (без зависимости dotenv): KEY=VALUE, # комментарии */
function parseDotEnvMessageBus(raw: string): McpEnvVars | null {
  const vars: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  const v: McpEnvVars = {
    MESSAGE_BUS_URL: vars.MESSAGE_BUS_URL?.trim() || undefined,
    MESSAGE_BUS_PROJECT_ID: vars.MESSAGE_BUS_PROJECT_ID?.trim() || undefined,
    MESSAGE_BUS_ACCESS_TOKEN:
      vars.MESSAGE_BUS_ACCESS_TOKEN?.trim() || vars.MESSAGE_BUS_TOKEN?.trim() || undefined,
    MESSAGE_BUS_TOKEN: vars.MESSAGE_BUS_TOKEN?.trim() || undefined,
  };
  return mcpEnvVarsMeaningful(v) ? v : null;
}

async function readDotEnvMcpFile(filePath: string): Promise<{ vars: McpEnvVars; file: string } | null> {
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
  const vars = parseDotEnvMessageBus(raw);
  return vars ? { vars, file: filePath } : null;
}

// ── Try all known config locations ──────────────────────────────────────

async function readMcpConfig(): Promise<{ vars: McpEnvVars; file: string } | null> {
  const root = repoRoot();

  const candidates: Array<() => Promise<{ vars: McpEnvVars; file: string } | null>> = [
    () => readDotEnvMcpFile(path.join(root, ".cursor", "mcp.env")),
    () => readJsonMcpFile(path.join(root, ".cursor", "mcp.json")),
    () => readTomlMcpFile(path.join(root, ".codex", "config.toml")),
    () => readJsonMcpFile(path.join(root, ".mcp.json")),
    () => readJsonMcpFile(path.join(root, ".claude", "mcp.json")),
  ];

  for (const tryRead of candidates) {
    const result = await tryRead();
    if (result) return result;
  }

  return null;
}

// ── Public API ──────────────────────────────────────────────────────────

export async function resolveSeedMessageBusConfig(): Promise<SeedMessageBusConfig> {
  const found = await readMcpConfig();
  const fromFile = found?.vars ?? null;
  const filePath = found?.file ?? "—";

  let urlSource: string;
  let url: string;
  if (process.env.MESSAGE_BUS_URL?.trim()) {
    url = process.env.MESSAGE_BUS_URL.trim();
    urlSource = "env MESSAGE_BUS_URL";
  } else if (fromFile?.MESSAGE_BUS_URL) {
    url = fromFile.MESSAGE_BUS_URL;
    urlSource = filePath;
  } else {
    url = "http://localhost:3333";
    urlSource = "default";
  }

  let projectIdSource: string;
  let projectId: string | undefined;
  if (process.env.MESSAGE_BUS_PROJECT_ID?.trim()) {
    projectId = process.env.MESSAGE_BUS_PROJECT_ID.trim();
    projectIdSource = "env MESSAGE_BUS_PROJECT_ID";
  } else if (fromFile?.MESSAGE_BUS_PROJECT_ID) {
    projectId = fromFile.MESSAGE_BUS_PROJECT_ID;
    projectIdSource = filePath;
  } else {
    projectIdSource = "⚠️  not set";
  }

  let accessTokenSource: string;
  let accessToken: string | undefined;
  if (process.env.MESSAGE_BUS_ACCESS_TOKEN?.trim()) {
    accessToken = process.env.MESSAGE_BUS_ACCESS_TOKEN.trim();
    accessTokenSource = "env MESSAGE_BUS_ACCESS_TOKEN";
  } else if (process.env.MESSAGE_BUS_TOKEN?.trim()) {
    accessToken = process.env.MESSAGE_BUS_TOKEN.trim();
    accessTokenSource = "env MESSAGE_BUS_TOKEN";
  } else if (fromFile?.MESSAGE_BUS_ACCESS_TOKEN) {
    accessToken = fromFile.MESSAGE_BUS_ACCESS_TOKEN;
    accessTokenSource = filePath;
  } else if (fromFile?.MESSAGE_BUS_TOKEN) {
    accessToken = fromFile.MESSAGE_BUS_TOKEN;
    accessTokenSource = filePath;
  } else {
    accessTokenSource = "none";
  }

  return {
    baseUrl: url.replace(/\/$/, ""),
    ...(projectId ? { projectId } : {}),
    ...(accessToken ? { accessToken } : {}),
    sources: {
      baseUrl: urlSource,
      projectId: projectIdSource,
      accessToken: accessTokenSource,
    },
  };
}

export function messageBusFetchHeaders(
  config: Pick<SeedMessageBusConfig, "projectId" | "accessToken">,
  jsonBody: boolean
): Record<string, string> {
  const h: Record<string, string> = {};
  if (jsonBody) h["Content-Type"] = "application/json";
  if (config.projectId) h["x-project-id"] = config.projectId;
  if (config.accessToken) h["Authorization"] = `Bearer ${config.accessToken}`;
  return h;
}
