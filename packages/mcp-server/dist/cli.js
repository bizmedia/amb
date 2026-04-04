#!/usr/bin/env node
"use strict";
/**
 * CLI for @bizmedia/amb-mcp
 *
 * Usage:
 *   amb-mcp                         — run MCP server (stdio, for Cursor)
 *   amb-mcp setup [path]            — validate env, API health, registry (no data seeding)
 *   Без path — интерактивный запрос "Введите путь до..."
 */
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = require("readline");
const index_1 = require("./index");
const load_project_env_1 = require("./load-project-env");
const setup_1 = require("./setup");
(0, load_project_env_1.loadProjectEnv)();
const argv = process.argv.slice(2);
const cmd = argv[0];
/** Путь к registry: из --registry/-r или позиционный аргумент после setup. */
function getRegistryPath() {
    const rIdx = argv.indexOf("--registry");
    if (rIdx !== -1 && argv[rIdx + 1])
        return argv[rIdx + 1];
    const shortR = argv.indexOf("-r");
    if (shortR !== -1 && argv[shortR + 1])
        return argv[shortR + 1];
    if (cmd === "setup" && argv[1] && !argv[1].startsWith("-")) {
        return argv[1];
    }
    return undefined;
}
function askRegistryPath() {
    return new Promise((resolve) => {
        if (!process.stdin.isTTY) {
            resolve(undefined);
            return;
        }
        const rl = (0, readline_1.createInterface)({ input: process.stdin, output: process.stdout });
        rl.question("Введите путь до папки или файла с агентами (Enter — .cursor/agents): ", (answer) => {
            rl.close();
            const trimmed = answer?.trim();
            resolve(trimmed === "" ? undefined : trimmed);
        });
    });
}
async function main() {
    let registryPath = getRegistryPath();
    if (registryPath === undefined && cmd === "setup") {
        registryPath = await askRegistryPath();
    }
    if (cmd === "setup") {
        await (0, setup_1.runSetup)(registryPath);
    }
    else if (!cmd || cmd === "server") {
        await (0, index_1.main)();
    }
    else {
        console.error("Usage:");
        console.error("  amb-mcp                        Run MCP server (for Cursor)");
        console.error("  amb-mcp setup [path]           Check API, PROJECT_ID, registry (no seeding)");
        console.error("");
        console.error("  path: .cursor/agents, .agents, ./my-registry.json, /abs/path/to/agents");
        console.error("  If registry.json is missing, agent markdown files are inferred automatically.");
        console.error("");
        console.error("Environment:");
        console.error("  MESSAGE_BUS_URL (default: http://localhost:3333)");
        console.error("  MESSAGE_BUS_PROJECT_ID (required for setup)");
        process.exit(1);
    }
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
