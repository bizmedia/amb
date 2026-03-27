import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docPath = join(__dirname, "..", "docs", "SCRIPTS.md");

try {
  process.stdout.write(readFileSync(docPath, "utf8"));
} catch (err) {
  console.error("Could not read docs/SCRIPTS.md:", err instanceof Error ? err.message : err);
  process.exit(1);
}
