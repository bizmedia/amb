import "dotenv/config";
import { createClient } from "@amb-app/sdk";

/** Сначала проект из `.cursor/mcp.json`, затем прежний демо-ID из сидов БД. */
const DEMO_PROJECT_IDS_IN_ORDER = [
  "70275f6d-2528-40b1-9dc3-266cdb72ddfc",
  "22222222-2222-4222-8222-222222222222",
] as const;

const ADMIN_EMAIL = process.env.AMB_SEED_EMAIL ?? "admin@local.test";
const ADMIN_PASSWORD = process.env.AMB_SEED_PASSWORD ?? "ChangeMe123!";

/** Same base as MCP (`MESSAGE_BUS_URL`); often Next dev or a reverse proxy in front of the API. */
const apiCandidates = [
  process.env.API_URL,
  process.env.MESSAGE_BUS_URL,
  "http://localhost:4334",
  "http://localhost:3334",
  "http://localhost:3333",
  "http://localhost:5334",
].filter(Boolean) as string[];

type DemoAgent = {
  role: string;
  name: string;
  capabilities?: unknown;
};

type DemoEpic = {
  title: string;
  description: string;
  status?: "OPEN" | "IN_PROGRESS" | "DONE";
};

type DemoSprint = {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  targetStatus: "PLANNED" | "ACTIVE" | "COMPLETED";
};

type DemoTask = {
  title: string;
  description: string;
  state: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeRole?: string;
  epicTitle?: string;
  sprintName?: string;
  dueDate?: string;
};

type DemoThread = {
  title: string;
  messages: {
    fromRole: string;
    toRole?: string;
    payload: Record<string, unknown>;
  }[];
};

const demoAgents: DemoAgent[] = [
  {
    role: "po",
    name: "Product Owner",
    capabilities: { area: "product", focus: ["roadmap", "prioritization"] },
  },
  {
    role: "ux",
    name: "UX Designer",
    capabilities: { area: "design", focus: ["journeys", "prototypes"] },
  },
  {
    role: "react-next-engineer",
    name: "Senior React + Next.js Engineer",
    capabilities: { area: "frontend", stack: ["Next.js", "React"] },
  },
  {
    role: "nest-engineer",
    name: "Senior Nest.js Engineer",
    capabilities: { area: "backend", stack: ["Nest.js", "Prisma"] },
  },
  {
    role: "qa",
    name: "QA Engineer",
    capabilities: { area: "quality", focus: ["e2e", "regression"] },
  },
  {
    role: "devops",
    name: "DevOps Engineer",
    capabilities: { area: "infra", focus: ["deploy", "observability"] },
  },
];

const demoEpics: DemoEpic[] = [
  {
    title: "Self-serve onboarding",
    description:
      "Reduce time to first value with clearer setup, guided activation, and better empty states.",
    status: "IN_PROGRESS",
  },
  {
    title: "Collaboration and notifications",
    description:
      "Make multi-agent collaboration visible through inbox quality, thread context, and release summaries.",
    status: "OPEN",
  },
  {
    title: "Reliability and launch readiness",
    description:
      "Prepare the product for external teams with health checks, resilience, and confidence signals.",
    status: "OPEN",
  },
];

const demoSprints: DemoSprint[] = [
  {
    name: "Sprint 23 - Foundation cleanup",
    goal: "Stabilize the platform baseline before improving activation.",
    startDate: "2026-03-03T09:00:00.000Z",
    endDate: "2026-03-14T18:00:00.000Z",
    targetStatus: "COMPLETED",
  },
  {
    name: "Sprint 24 - Activation funnel",
    goal: "Improve onboarding clarity and shorten time to first successful workflow.",
    startDate: "2026-03-17T09:00:00.000Z",
    endDate: "2026-03-28T18:00:00.000Z",
    targetStatus: "ACTIVE",
  },
  {
    name: "Sprint 25 - Launch hardening",
    goal: "Polish reliability, observability, and handoff quality for the public launch.",
    startDate: "2026-03-31T09:00:00.000Z",
    endDate: "2026-04-11T18:00:00.000Z",
    targetStatus: "PLANNED",
  },
];

const demoTasks: DemoTask[] = [
  {
    title: "Baseline activation funnel metrics",
    description:
      "Instrument sign-up to first-thread flow and expose completion drop-off in the dashboard.",
    state: "DONE",
    priority: "HIGH",
    assigneeRole: "po",
    epicTitle: "Self-serve onboarding",
    sprintName: "Sprint 23 - Foundation cleanup",
    dueDate: "2026-03-10T15:00:00.000Z",
  },
  {
    title: "Clean up stale inbox retries",
    description:
      "Reduce noisy retries in the message pipeline so operators can focus on real delivery failures.",
    state: "DONE",
    priority: "MEDIUM",
    assigneeRole: "nest-engineer",
    epicTitle: "Reliability and launch readiness",
    sprintName: "Sprint 23 - Foundation cleanup",
    dueDate: "2026-03-12T15:00:00.000Z",
  },
  {
    title: "Redesign empty state for new projects",
    description:
      "Show a guided first-run checklist with clear next actions when a new project has no agents or threads.",
    state: "IN_PROGRESS",
    priority: "HIGH",
    assigneeRole: "ux",
    epicTitle: "Self-serve onboarding",
    sprintName: "Sprint 24 - Activation funnel",
    dueDate: "2026-03-27T15:00:00.000Z",
  },
  {
    title: "Implement onboarding checklist cards",
    description:
      "Ship dashboard cards for connect MCP, seed agents, create thread, and send first message.",
    state: "IN_PROGRESS",
    priority: "URGENT",
    assigneeRole: "react-next-engineer",
    epicTitle: "Self-serve onboarding",
    sprintName: "Sprint 24 - Activation funnel",
    dueDate: "2026-03-29T15:00:00.000Z",
  },
  {
    title: "Add health snapshot to dashboard header",
    description:
      "Expose API health, inbox backlog, and DLQ count in one compact summary for operators.",
    state: "TODO",
    priority: "HIGH",
    assigneeRole: "devops",
    epicTitle: "Reliability and launch readiness",
    sprintName: "Sprint 24 - Activation funnel",
    dueDate: "2026-03-28T12:00:00.000Z",
  },
  {
    title: "Thread summaries in release handoff",
    description:
      "Generate short release-oriented summaries from busy threads so product and QA can review faster.",
    state: "TODO",
    priority: "MEDIUM",
    assigneeRole: "po",
    epicTitle: "Collaboration and notifications",
    sprintName: "Sprint 24 - Activation funnel",
    dueDate: "2026-03-30T15:00:00.000Z",
  },
  {
    title: "Project token audit timeline",
    description:
      "Add a product-facing timeline for token issuance, revocation, and last usage to support launch ops.",
    state: "BACKLOG",
    priority: "MEDIUM",
    assigneeRole: "nest-engineer",
    epicTitle: "Reliability and launch readiness",
    sprintName: "Sprint 25 - Launch hardening",
    dueDate: "2026-04-07T15:00:00.000Z",
  },
  {
    title: "Notification digest for assignees",
    description:
      "Batch task and thread changes into a single digest to keep contributors aligned without spamming them.",
    state: "BACKLOG",
    priority: "LOW",
    assigneeRole: "react-next-engineer",
    epicTitle: "Collaboration and notifications",
    sprintName: "Sprint 25 - Launch hardening",
    dueDate: "2026-04-08T15:00:00.000Z",
  },
  {
    title: "Regression pack for demo environment",
    description:
      "Lock a focused QA pack that validates auth, projects, tasks, and inbox flows before demos and releases.",
    state: "TODO",
    priority: "HIGH",
    assigneeRole: "qa",
    epicTitle: "Reliability and launch readiness",
    sprintName: "Sprint 25 - Launch hardening",
    dueDate: "2026-04-09T15:00:00.000Z",
  },
];

const demoThreads: DemoThread[] = [
  {
    title: "roadmap-planning",
    messages: [
      {
        fromRole: "po",
        toRole: "ux",
        payload: {
          type: "demo_note",
          subject: "Q2 activation theme",
          text: "Focus the next milestone on first-run clarity. The product should feel useful within five minutes.",
        },
      },
      {
        fromRole: "ux",
        toRole: "react-next-engineer",
        payload: {
          type: "demo_note",
          subject: "Checklist concept",
          text: "I want the onboarding checklist to guide setup in four steps, with clear success markers after each action.",
        },
      },
    ],
  },
  {
    title: "sprint-handoff",
    messages: [
      {
        fromRole: "react-next-engineer",
        toRole: "nest-engineer",
        payload: {
          type: "demo_note",
          subject: "Header health snapshot",
          text: "Frontend can consume the health payload once the API exposes stable counts for DLQ and pending inbox items.",
        },
      },
      {
        fromRole: "nest-engineer",
        toRole: "qa",
        payload: {
          type: "demo_note",
          subject: "Ready for contract checks",
          text: "Project token audit events are consistent in the API now. QA can validate timeline ordering and authorization edges.",
        },
      },
    ],
  },
  {
    title: "launch-readiness",
    messages: [
      {
        fromRole: "qa",
        toRole: "devops",
        payload: {
          type: "demo_note",
          subject: "Demo env checklist",
          text: "Need a lightweight smoke suite before each customer demo: login, project switch, task board, inbox, and thread view.",
        },
      },
    ],
  },
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

async function resolveApiUrl(): Promise<string> {
  for (const candidate of apiCandidates) {
    try {
      const response = await fetch(`${candidate}/api/health`);
      if (response.ok) return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    `AMB API is not reachable. Checked: ${apiCandidates.join(", ")}`
  );
}

async function login(apiUrl: string): Promise<string> {
  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { data?: { accessToken?: string } }
    | null;

  if (!response.ok || !payload?.data?.accessToken) {
    throw new Error(
      `Failed to login as ${ADMIN_EMAIL}. Check AMB_SEED_EMAIL / AMB_SEED_PASSWORD.`
    );
  }

  return payload.data.accessToken;
}

async function ensureProject(client: ReturnType<typeof createClient>) {
  const projects = await client.listProjects();
  const forcedId = process.env.MESSAGE_BUS_PROJECT_ID?.trim();
  if (forcedId) {
    const match = projects.find((project) => project.id === forcedId);
    if (!match) {
      throw new Error(
        `MESSAGE_BUS_PROJECT_ID=${forcedId} не найден среди проектов текущего пользователя. Войдите под учёткой с доступом к этому проекту или уберите переменную.`
      );
    }
    return match;
  }

  for (const id of DEMO_PROJECT_IDS_IN_ORDER) {
    const match = projects.find((project) => project.id === id);
    if (match) return match;
  }

  const existing =
    projects.find((project) => normalize(project.slug) === "default") ??
    projects.find((project) => normalize(project.name) === "default project");

  if (existing) return existing;

  return client.createProject({ name: "Default Project", taskPrefix: "AMB" });
}

async function ensureAgents(client: ReturnType<typeof createClient>) {
  const existing = await client.listAgents();
  const byRole = new Map(existing.map((agent) => [agent.role, agent]));

  for (const agent of demoAgents) {
    if (byRole.has(agent.role)) continue;
    const created = await client.registerAgent({
      name: agent.name,
      role: agent.role,
      capabilities: agent.capabilities,
    });
    byRole.set(created.role, created);
  }

  return byRole;
}

async function ensureThreads(client: ReturnType<typeof createClient>) {
  const existing = await client.listThreads();
  const byTitle = new Map(existing.map((thread) => [thread.title, thread]));

  for (const thread of demoThreads) {
    if (byTitle.has(thread.title)) continue;
    const created = await client.createThread({ title: thread.title, status: "open" });
    byTitle.set(created.title, created);
  }

  return byTitle;
}

async function ensureMessages(
  client: ReturnType<typeof createClient>,
  threads: Map<string, { id: string; title: string }>,
  agents: Map<string, { id: string }>
) {
  let created = 0;

  for (const thread of demoThreads) {
    const current = threads.get(thread.title);
    if (!current) continue;

    const existingMessages = await client.getThreadMessages(current.id);
    const existingSubjects = new Set(
      existingMessages
        .map((message) => {
          const payload = message.payload as { subject?: string; type?: string };
          return payload.type === "demo_note" ? payload.subject : null;
        })
        .filter(Boolean)
    );

    for (const message of thread.messages) {
      const subject = String(message.payload.subject ?? "");
      if (existingSubjects.has(subject)) continue;
      const fromAgentId = agents.get(message.fromRole)?.id;
      if (!fromAgentId) continue;
      await client.sendMessage({
        threadId: current.id,
        fromAgentId,
        toAgentId: message.toRole ? agents.get(message.toRole)?.id ?? null : null,
        payload: message.payload,
      });
      created += 1;
    }
  }

  return created;
}

async function ensureEpics(client: ReturnType<typeof createClient>, projectId: string) {
  const existing = await client.epics.list(projectId, {});
  const byTitle = new Map(existing.map((epic) => [normalize(epic.title), epic]));

  for (const epic of demoEpics) {
    const current = byTitle.get(normalize(epic.title));
    if (!current) {
      const created = await client.epics.create(projectId, epic);
      byTitle.set(normalize(created.title), created);
      continue;
    }

    await client.epics.update(projectId, current.id, {
      description: epic.description,
      status: epic.status,
    });
  }

  const refreshed = await client.epics.list(projectId, {});
  return new Map(refreshed.map((epic) => [normalize(epic.title), epic]));
}

async function syncSprintStatus(
  client: ReturnType<typeof createClient>,
  projectId: string,
  sprint: { id: string; status: string },
  targetStatus: DemoSprint["targetStatus"]
) {
  if (sprint.status === targetStatus) {
    return;
  }

  await client.sprints.update(projectId, sprint.id, { status: targetStatus });
}

async function ensureSprints(client: ReturnType<typeof createClient>, projectId: string) {
  const existing = await client.sprints.list(projectId, {});
  const byName = new Map(existing.map((sprint) => [normalize(sprint.name), sprint]));

  for (const sprint of demoSprints) {
    const current = byName.get(normalize(sprint.name));
    if (!current) {
      const created = await client.sprints.create(projectId, sprint);
      byName.set(normalize(created.name), created);
      continue;
    }

    await client.sprints.update(projectId, current.id, {
      goal: sprint.goal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    });
  }

  const refreshed = await client.sprints.list(projectId, {});
  return new Map(refreshed.map((sprint) => [normalize(sprint.name), sprint]));
}

async function prepareSprintsForTaskAssignment(
  client: ReturnType<typeof createClient>,
  projectId: string,
  sprints: Map<string, { id: string; status: string; name: string }>
) {
  for (const demoSprint of demoSprints) {
    const sprint = sprints.get(normalize(demoSprint.name));
    if (!sprint) continue;

    if (demoSprint.targetStatus === "COMPLETED" && sprint.status === "COMPLETED") {
      await client.sprints.update(projectId, sprint.id, { status: "PLANNED" });
    }
  }

  const refreshed = await client.sprints.list(projectId, {});
  return new Map(refreshed.map((sprint) => [normalize(sprint.name), sprint]));
}

async function finalizeSprintStatuses(
  client: ReturnType<typeof createClient>,
  projectId: string,
  sprints: Map<string, { id: string; status: string; name: string }>
) {
  let refreshed = new Map(sprints);

  for (const demoSprint of demoSprints.filter((item) => item.targetStatus !== "ACTIVE")) {
    const sprint = refreshed.get(normalize(demoSprint.name));
    if (!sprint) continue;
    await syncSprintStatus(client, projectId, sprint, demoSprint.targetStatus);
    const latest = await client.sprints.list(projectId, {});
    refreshed = new Map(latest.map((item) => [normalize(item.name), item]));
  }

  for (const demoSprint of demoSprints.filter((item) => item.targetStatus === "ACTIVE")) {
    const sprint = refreshed.get(normalize(demoSprint.name));
    if (!sprint) continue;
    await syncSprintStatus(client, projectId, sprint, demoSprint.targetStatus);
    const latest = await client.sprints.list(projectId, {});
    refreshed = new Map(latest.map((item) => [normalize(item.name), item]));
  }

  return refreshed;
}

async function ensureTasks(
  client: ReturnType<typeof createClient>,
  projectId: string,
  agents: Map<string, { id: string }>,
  epics: Map<string, { id: string }>,
  sprints: Map<string, { id: string }>
) {
  const existing = await client.listTasks(projectId);
  const byTitle = new Map(existing.map((task) => [normalize(task.title), task]));

  for (const task of demoTasks) {
    let current = byTitle.get(normalize(task.title));

    if (!current) {
      current = await client.createTask(projectId, {
        title: task.title,
        description: task.description,
        state: task.state,
        priority: task.priority,
        assigneeId: task.assigneeRole ? agents.get(task.assigneeRole)?.id ?? null : null,
        dueDate: task.dueDate ?? null,
      });
      byTitle.set(normalize(current.title), current);
    }

    await client.updateTask(projectId, current.id, {
      description: task.description,
      state: task.state,
      priority: task.priority,
      assigneeId: task.assigneeRole ? agents.get(task.assigneeRole)?.id ?? null : null,
      epicId: task.epicTitle ? epics.get(normalize(task.epicTitle))?.id ?? null : null,
      sprintId: task.sprintName ? sprints.get(normalize(task.sprintName))?.id ?? null : null,
      dueDate: task.dueDate ?? null,
    });
  }
}

async function main() {
  const apiUrl = await resolveApiUrl();
  const token = await login(apiUrl);
  const client = createClient({ baseUrl: apiUrl, token });
  const project = await ensureProject(client);
  if (process.env.MESSAGE_BUS_PROJECT_ID?.trim()) {
    console.log(`Используется проект из MESSAGE_BUS_PROJECT_ID: ${project.id}`);
  }

  client.setProjectId(project.id);

  const agents = await ensureAgents(client);
  const threads = await ensureThreads(client);
  const createdMessages = await ensureMessages(client, threads, agents);
  const epics = await ensureEpics(client, project.id);
  const sprints = await ensureSprints(client, project.id);
  const preparedSprints = await prepareSprintsForTaskAssignment(client, project.id, sprints);
  await ensureTasks(client, project.id, agents, epics, preparedSprints);
  await finalizeSprintStatuses(client, project.id, preparedSprints);

  const [tasks, sprintList, epicList] = await Promise.all([
    client.listTasks(project.id),
    client.sprints.list(project.id, {}),
    client.epics.list(project.id, {}),
  ]);

  console.log("Demo product data synced.");
  console.log(`apiUrl=${apiUrl}`);
  console.log(`projectId=${project.id}`);
  console.log(`agents=${agents.size}`);
  console.log(`threads=${threads.size}`);
  console.log(`demoMessagesAdded=${createdMessages}`);
  console.log(`epics=${epicList.length}`);
  console.log(`sprints=${sprintList.length}`);
  console.log(`tasks=${tasks.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
