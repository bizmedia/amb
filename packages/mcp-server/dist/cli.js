#!/usr/bin/env node
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = require("readline");
const index_1 = require("./index");
const seed_agents_1 = require("./seed-agents");
const seed_threads_1 = require("./seed-threads");
const setup_1 = require("./setup");
const argv = process.argv.slice(2);
const cmd = argv[0];
const sub = argv[1];
/** Путь к registry: из --registry/-r или позиционный аргумент после setup/agents/threads/all. */
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
    // Позиционный аргумент: seed agents <path> / seed threads <path> / seed all <path>
    if ((sub === "agents" || sub === "threads" || sub === "all") && argv[2] && !argv[2].startsWith("-"))
        return argv[2];
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
    if (registryPath === undefined &&
        (cmd === "setup" || (cmd === "seed" && (sub === "agents" || sub === "threads" || sub === "all")))) {
        registryPath = await askRegistryPath();
    }
    if (cmd === "seed" && sub === "agents") {
        await (0, seed_agents_1.runSeedAgents)(registryPath);
    }
    else if (cmd === "seed" && sub === "threads") {
        await (0, seed_threads_1.runSeedThreads)(registryPath);
    }
    else if (cmd === "seed" && sub === "all") {
        await (0, seed_agents_1.runSeedAgents)(registryPath);
        console.log("");
        await (0, seed_threads_1.runSeedThreads)(registryPath);
    }
    else if (cmd === "setup") {
        await (0, setup_1.runSetup)(registryPath);
    }
    else if (!cmd || cmd === "server") {
        await (0, index_1.main)();
    }
    else {
        console.error("Usage:");
        console.error("  amb-mcp                        Run MCP server (for Cursor)");
        console.error("  amb-mcp setup [path]           Setup agents and threads for the current project");
        console.error("  amb-mcp seed agents [path]     Seed agents (path: file or folder)");
        console.error("  amb-mcp seed threads [path]   Seed threads");
        console.error("  amb-mcp seed all [path]       Seed agents and threads");
        console.error("  amb-mcp seed agents -r <path> Same, path via --registry / -r");
        console.error("");
        console.error("  path: .cursor/agents, .agents, ./my-registry.json, /abs/path/to/agents");
        console.error("  If registry.json is missing, agent markdown files are inferred automatically.");
        console.error("");
        console.error("Environment:");
        console.error("  MESSAGE_BUS_URL (default: http://localhost:3333)");
        console.error("  MESSAGE_BUS_PROJECT_ID (required for setup, recommended for seed)");
        process.exit(1);
    }
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
