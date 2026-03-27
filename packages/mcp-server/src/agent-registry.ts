import fs from "fs/promises";
import path from "path";

export type Registry = {
  project: string;
  mode?: string;
  agents: {
    id: string;
    name: string;
    role: string;
    systemPromptFile?: string;
    defaultThreads?: string[];
  }[];
};

export type LoadedRegistry = {
  registry: Registry;
  registryFile: string;
  source: "file" | "generated";
  agentsDir: string;
};

async function exists(targetPath: string): Promise<boolean> {
  const stat = await fs.stat(targetPath).catch(() => null);
  return Boolean(stat);
}

function humanizeRole(role: string): string {
  return role
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function resolveDefaultRegistryFile(): Promise<string> {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, ".cursor/agents/registry.json"),
    path.resolve(cwd, ".cursor/agents"),
    path.resolve(cwd, ".agents/registry.json"),
    path.resolve(cwd, ".agents"),
  ];

  for (const candidate of candidates) {
    const stat = await fs.stat(candidate).catch(() => null);
    if (stat?.isFile()) {
      return candidate;
    }
    if (stat?.isDirectory()) {
      return path.join(candidate, "registry.json");
    }
  }

  return path.resolve(cwd, ".cursor/agents/registry.json");
}

export async function resolveRegistryFile(registryPath?: string): Promise<string> {
  if (!registryPath) {
    return resolveDefaultRegistryFile();
  }

  const resolved = path.resolve(process.cwd(), registryPath);
  const stat = await fs.stat(resolved).catch(() => null);
  if (stat?.isDirectory()) {
    return path.join(resolved, "registry.json");
  }
  return resolved;
}

async function buildRegistryFromAgentsFolder(registryFile: string): Promise<Registry> {
  const agentsDir = path.dirname(registryFile);
  const entries = await fs.readdir(agentsDir, { withFileTypes: true }).catch(() => []);

  const mdFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .filter((fileName) => fileName.toLowerCase() !== "readme.md")
    .sort((a, b) => a.localeCompare(b));

  const agents = mdFiles.map((fileName) => {
    const role = path.basename(fileName, ".md");
    return {
      id: role,
      name: humanizeRole(role),
      role,
      systemPromptFile: path.join(path.relative(process.cwd(), agentsDir), fileName).replace(/\\/g, "/"),
      defaultThreads: [`${role}-tasks`],
    };
  });

  return {
    project: path.basename(process.cwd()),
    mode: "auto-generated",
    agents,
  };
}

export async function loadOrCreateRegistry(registryPath?: string): Promise<LoadedRegistry> {
  const registryFile = await resolveRegistryFile(registryPath);
  const agentsDir = path.dirname(registryFile);

  if (await exists(registryFile)) {
    const raw = await fs.readFile(registryFile, "utf-8");
    return {
      registry: JSON.parse(raw) as Registry,
      registryFile,
      source: "file",
      agentsDir,
    };
  }

  const registry = await buildRegistryFromAgentsFolder(registryFile);
  await fs.mkdir(agentsDir, { recursive: true });
  await fs.writeFile(registryFile, `${JSON.stringify(registry, null, 2)}\n`, "utf-8");

  console.log(`ℹ️  registry.json not found, created automatically: ${registryFile}`);
  console.log(`ℹ️  Inferred agents from markdown files: ${registry.agents.length}\n`);

  return {
    registry,
    registryFile,
    source: "generated",
    agentsDir,
  };
}
