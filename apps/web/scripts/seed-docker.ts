import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@amb-app/sdk";

type Registry = {
  agents: {
    name: string;
    role: string;
    defaultThreads?: string[];
  }[];
};

const API_URL = process.env.API_URL ?? "http://localhost:3334";
const ADMIN_EMAIL = process.env.AMB_SEED_EMAIL ?? "admin@local.test";
const ADMIN_PASSWORD = process.env.AMB_SEED_PASSWORD ?? "ChangeMe123!";
const SEED_THREADS = process.env.AMB_SEED_THREADS === "true";
const PROJECT_ID_FROM_ENV = process.env.MESSAGE_BUS_PROJECT_ID;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function login(): Promise<string> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data?.accessToken) {
    throw new Error("Failed to login for docker seed");
  }
  return payload.data.accessToken as string;
}

async function readRegistry(): Promise<Registry> {
  const candidates = [
    path.resolve(".cursor/agents/registry.json"),
    path.resolve("../../.cursor/agents/registry.json"),
    "/workspace/.cursor/agents/registry.json",
  ];

  for (const registryPath of candidates) {
    try {
      const raw = await fs.readFile(registryPath, "utf-8");
      return JSON.parse(raw) as Registry;
    } catch {
      // try next
    }
  }

  throw new Error("registry.json not found (.cursor/agents/registry.json)");
}

async function resolveProjectId(token: string): Promise<string | null> {
  if (PROJECT_ID_FROM_ENV && UUID_PATTERN.test(PROJECT_ID_FROM_ENV)) {
    return PROJECT_ID_FROM_ENV;
  }

  const client = createClient({ baseUrl: API_URL, token });
  const projects = await client.listProjects();
  const preferredProject =
    projects.find((project) => project.slug === "default") ??
    projects.find((project) => project.name.trim().toLowerCase() === "default project") ??
    projects[0];

  return preferredProject?.id ?? null;
}

async function seedAgentsAndThreads(token: string, projectId: string) {
  if (!UUID_PATTERN.test(projectId)) {
    throw new Error(`Resolved projectId is not a valid UUID: ${projectId}`);
  }

  const registry = await readRegistry();
  const client = createClient({ baseUrl: API_URL, token, projectId });

  const existingAgents = await client.listAgents();
  const roleSet = new Set(existingAgents.map((agent) => agent.role));

  let createdAgents = 0;
  for (const agent of registry.agents) {
    if (roleSet.has(agent.role)) continue;
    await client.registerAgent({ name: agent.name, role: agent.role });
    createdAgents += 1;
  }

  let createdThreads = 0;
  if (SEED_THREADS) {
    const existingThreads = await client.listThreads();
    const titleSet = new Set(existingThreads.map((thread) => thread.title));
    const threadTitles = new Set<string>();

    for (const agent of registry.agents) {
      for (const threadTitle of agent.defaultThreads ?? []) {
        threadTitles.add(threadTitle);
      }
    }

    for (const title of ["general", "announcements", "incidents", "releases"]) {
      threadTitles.add(title);
    }

    for (const title of threadTitles) {
      if (titleSet.has(title)) continue;
      await client.createThread({ title, status: "open" });
      createdThreads += 1;
    }
  }

  console.log(`Seed complete. projectId=${projectId} createdAgents=${createdAgents} createdThreads=${createdThreads}`);
}

async function main() {
  const token = await login();
  const projectId = await resolveProjectId(token);
  if (!projectId) {
    console.log(
      "Docker seed skipped: no projects yet. Create a project in the Dashboard, then re-run seed or set MESSAGE_BUS_PROJECT_ID."
    );
    return;
  }
  await seedAgentsAndThreads(token, projectId);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
