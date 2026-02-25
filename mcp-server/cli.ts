#!/usr/bin/env node
/**
 * CLI for @bizmedia/amb-mcp
 *
 * Usage:
 *   amb-mcp                         — run MCP server (stdio, for Cursor)
 *   amb-mcp seed agents [path]      — seed agents (path: file or folder with registry.json)
 *   amb-mcp seed threads [path]    — seed threads
 *   amb-mcp seed all [path]        — seed agents and threads
 *   amb-mcp seed agents -r <path>  — same, path via --registry / -r
 *   Без path — интерактивный запрос "Введите путь до..."
 */

import readline from "readline";
import { main as runMcpServer } from "./index.js";
import { runSeedAgents } from "./seed-agents.js";
import { runSeedThreads } from "./seed-threads.js";

const argv = process.argv.slice(2);
const cmd = argv[0];
const sub = argv[1];

/** Путь к registry: из --registry/-r или позиционный аргумент после agents/threads/all. */
function getRegistryPath(): string | undefined {
  const rIdx = argv.indexOf("--registry");
  if (rIdx !== -1 && argv[rIdx + 1]) return argv[rIdx + 1];
  const shortR = argv.indexOf("-r");
  if (shortR !== -1 && argv[shortR + 1]) return argv[shortR + 1];
  // Позиционный аргумент: seed agents <path> / seed threads <path> / seed all <path>
  if ((sub === "agents" || sub === "threads" || sub === "all") && argv[2] && !argv[2].startsWith("-"))
    return argv[2];
  return undefined;
}

function askRegistryPath(): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      resolve(undefined);
      return;
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(
      "Введите путь до папки или файла с агентами (Enter — .cursor/agents): ",
      (answer) => {
        rl.close();
        const trimmed = answer?.trim();
        resolve(trimmed === "" ? undefined : trimmed);
      }
    );
  });
}

async function main(): Promise<void> {
  let registryPath = getRegistryPath();
  if (registryPath === undefined && (cmd === "seed" && (sub === "agents" || sub === "threads" || sub === "all"))) {
    registryPath = await askRegistryPath();
  }

  if (cmd === "seed" && sub === "agents") {
    await runSeedAgents(registryPath);
  } else if (cmd === "seed" && sub === "threads") {
    await runSeedThreads(registryPath);
  } else if (cmd === "seed" && sub === "all") {
    await runSeedAgents(registryPath);
    console.log("");
    await runSeedThreads(registryPath);
  } else if (!cmd || cmd === "server") {
    await runMcpServer();
  } else {
    console.error("Usage:");
    console.error("  amb-mcp                        Run MCP server (for Cursor)");
    console.error("  amb-mcp seed agents [path]     Seed agents (path: file or folder)");
    console.error("  amb-mcp seed threads [path]   Seed threads");
    console.error("  amb-mcp seed all [path]       Seed agents and threads");
    console.error("  amb-mcp seed agents -r <path> Same, path via --registry / -r");
    console.error("");
    console.error("  path: .cursor/agents, ./my-registry.json, /abs/path/to/agents");
    console.error("  If path is a folder, registry.json is expected inside it.");
    console.error("");
    console.error("Environment: MESSAGE_BUS_URL (default: http://localhost:3333)");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
