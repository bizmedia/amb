import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const VERSION = process.argv[2];
const VERSION_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

if (!VERSION) {
  console.error(
    "Usage: pnpm bump:version <version>   (e.g. pnpm bump:version 1.3.3)",
  );
  process.exit(1);
}

if (!VERSION_RE.test(VERSION)) {
  console.error(`Invalid version: ${VERSION}`);
  process.exit(1);
}

const PACKAGE_FILES = [
  "package.json",
  "apps/api/package.json",
  "apps/web/package.json",
  "packages/core/package.json",
  "packages/db/package.json",
  "packages/eslint-config/package.json",
  "packages/mcp-server/package.json",
  "packages/sdk/package.json",
  "packages/shared/package.json",
  "packages/typescript-config/package.json",
  "packages/ui/package.json",
];

for (const relativePath of PACKAGE_FILES) {
  const absolutePath = join(ROOT, relativePath);
  const data = JSON.parse(readFileSync(absolutePath, "utf8"));
  data.version = VERSION;
  if (relativePath === "package.json" && data.devDependencies?.["@openaisdk/amb-mcp"]) {
    data.devDependencies["@openaisdk/amb-mcp"] = `^${VERSION}`;
  }
  writeFileSync(absolutePath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated ${relativePath} -> ${VERSION}`);
}
