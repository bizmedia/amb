import fs from "fs";
import path from "path";
import { config as loadDotEnv } from "dotenv";

let loaded = false;

const ENV_CANDIDATES = [
  path.join(".cursor", "mcp.env"),
  ".env.local",
  ".env",
];

export function loadProjectEnv(): void {
  if (loaded) return;
  loaded = true;

  const cwd = process.cwd();
  for (const relativePath of ENV_CANDIDATES) {
    const filePath = path.join(cwd, relativePath);
    if (!fs.existsSync(filePath)) continue;
    loadDotEnv({ path: filePath, override: false });
  }
}
