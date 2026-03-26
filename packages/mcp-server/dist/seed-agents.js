"use strict";
/**
 * Seed agents from .cursor/agents/registry.json into the Message Bus API.
 * Reads registry from current working directory (project that installed the package).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeedAgents = runSeedAgents;
require("dotenv/config");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const BASE_URL = process.env.MESSAGE_BUS_URL ?? "http://localhost:3333";
const API_URL = `${BASE_URL}/api/agents`;
const PROJECT_ID = process.env.MESSAGE_BUS_PROJECT_ID;
async function getExistingAgents() {
    try {
        const res = await fetch(API_URL, {
            headers: PROJECT_ID ? { "x-project-id": PROJECT_ID } : undefined,
        });
        if (!res.ok)
            return new Map();
        const json = await res.json();
        const agents = json.data;
        return new Map(agents.map((a) => [a.role, a]));
    }
    catch {
        return new Map();
    }
}
/** Разрешает путь к файлу registry: если передан каталог — ищет registry.json внутри. */
async function resolveRegistryFile(registryPath) {
    if (!registryPath) {
        return path_1.default.resolve(process.cwd(), ".cursor/agents/registry.json");
    }
    const resolved = path_1.default.resolve(process.cwd(), registryPath);
    const stat = await promises_1.default.stat(resolved).catch(() => null);
    if (stat?.isDirectory()) {
        return path_1.default.join(resolved, "registry.json");
    }
    return resolved;
}
function humanizeRole(role) {
    return role
        .split(/[-_]/g)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
async function buildRegistryFromAgentsFolder(registryFile) {
    const agentsDir = path_1.default.dirname(registryFile);
    const entries = await promises_1.default.readdir(agentsDir, { withFileTypes: true }).catch(() => []);
    const mdFiles = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b));
    const agents = mdFiles.map((fileName) => {
        const role = path_1.default.basename(fileName, ".md");
        return {
            id: role,
            name: humanizeRole(role),
            role,
            systemPromptFile: path_1.default.join(path_1.default.relative(process.cwd(), agentsDir), fileName).replace(/\\/g, "/"),
            defaultThreads: [`${role}-tasks`],
        };
    });
    return {
        project: path_1.default.basename(process.cwd()),
        mode: "auto-generated",
        agents,
    };
}
async function loadOrCreateRegistry(registryFile) {
    const raw = await promises_1.default.readFile(registryFile, "utf-8").catch(() => null);
    if (raw) {
        return JSON.parse(raw);
    }
    const registry = await buildRegistryFromAgentsFolder(registryFile);
    await promises_1.default.mkdir(path_1.default.dirname(registryFile), { recursive: true });
    await promises_1.default.writeFile(registryFile, `${JSON.stringify(registry, null, 2)}\n`, "utf-8");
    console.log(`ℹ️  registry.json не найден, создан автоматически: ${registryFile}`);
    console.log(`ℹ️  Найдено агентов по *.md: ${registry.agents.length}\n`);
    return registry;
}
async function runSeedAgents(registryPath) {
    const resolved = await resolveRegistryFile(registryPath);
    const registry = await loadOrCreateRegistry(resolved);
    console.log(`🌱 Seeding agents for project: ${registry.project}\n`);
    if (!registry.agents.length) {
        console.log("⚠️  В registry нет агентов. Добавьте *.md в .cursor/agents или заполните registry.json.");
        return;
    }
    const existingAgents = await getExistingAgents();
    console.log(`📋 Existing agents: ${existingAgents.size}\n`);
    let created = 0;
    let skipped = 0;
    for (const agent of registry.agents) {
        const existing = existingAgents.get(agent.role);
        if (existing) {
            console.log(`⏭️  Skip (exists): ${agent.role} → ${existing.id}`);
            skipped++;
            continue;
        }
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(PROJECT_ID ? { "x-project-id": PROJECT_ID } : {}),
            },
            body: JSON.stringify({
                name: agent.name,
                role: agent.role,
            }),
        });
        if (!res.ok) {
            console.error(`❌ Failed to seed agent ${agent.id}`);
            console.error(await res.text());
            continue;
        }
        const json = await res.json();
        console.log(`✅ Created: ${agent.role} → ${json.data.id}`);
        created++;
    }
    console.log("\n────────────────────────────────────");
    console.log(`✅ Created: ${created}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log("🎉 Agent seeding complete.");
}
