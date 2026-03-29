#!/usr/bin/env node
/**
 * Создаёт в AMB эпик, спринт и декомпозицию по docs/PRD-message-task-linking.md (§12).
 * Идемпотентно: совпадение по точному title задачи — пропуск создания, при необходимости PATCH epic/sprint.
 *
 *   node scripts/seed-prd-message-task-linking-amb.mjs
 *
 * Env, .cursor/mcp.env или .cursor/mcp.json: MESSAGE_BUS_URL, MESSAGE_BUS_PROJECT_ID, MESSAGE_BUS_ACCESS_TOKEN.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

function parseDotEnv(raw) {
  const vars = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    vars[t.slice(0, eq).trim()] = val;
  }
  return vars;
}

function loadMcpEnv() {
  const envPath = path.join(REPO_ROOT, ".cursor", "mcp.env");
  try {
    const raw = fs.readFileSync(envPath, "utf8");
    const v = parseDotEnv(raw);
    const baseUrl = v.MESSAGE_BUS_URL?.trim();
    const projectId = v.MESSAGE_BUS_PROJECT_ID?.trim();
    const token =
      v.MESSAGE_BUS_ACCESS_TOKEN?.trim() || v.MESSAGE_BUS_TOKEN?.trim();
    if (baseUrl || projectId || token) {
      return { baseUrl, projectId, token };
    }
  } catch {
    /* no mcp.env */
  }

  const mcpPath = path.join(REPO_ROOT, ".cursor", "mcp.json");
  try {
    const raw = fs.readFileSync(mcpPath, "utf8");
    const j = JSON.parse(raw.replace(/,\s*([\]}])/g, "$1"));
    const env = j?.mcpServers?.["message-bus"]?.env ?? {};
    return {
      baseUrl: env.MESSAGE_BUS_URL?.trim(),
      projectId: env.MESSAGE_BUS_PROJECT_ID?.trim(),
      token: env.MESSAGE_BUS_ACCESS_TOKEN?.trim() || env.MESSAGE_BUS_TOKEN?.trim(),
    };
  } catch {
    return {};
  }
}

const fromFile = loadMcpEnv();
const BASE = process.env.MESSAGE_BUS_URL?.trim() || fromFile.baseUrl;
const PROJECT_ID = process.env.MESSAGE_BUS_PROJECT_ID?.trim() || fromFile.projectId;
const TOKEN = process.env.MESSAGE_BUS_ACCESS_TOKEN?.trim() || fromFile.token;

if (!BASE || !PROJECT_ID || !TOKEN) {
  console.error(
    "Нужны MESSAGE_BUS_URL, MESSAGE_BUS_PROJECT_ID, MESSAGE_BUS_ACCESS_TOKEN (переменные окружения, .cursor/mcp.env или устаревший inline env в .cursor/mcp.json)."
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function api(method, pathname, body) {
  const url = `${BASE.replace(/\/$/, "")}/api${pathname}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${pathname} → ${res.status}: ${text.slice(0, 500)}`);
  }
  return data;
}

const EPIC_TITLE = "E10: Message ↔ Task linking (PRD)";
const SPRINT_NAME = "Sprint: message-task linking";

const TASKS = [
  {
    title: "E10-S0: Закрыть открытые вопросы PRD (§10)",
    description:
      "Решить: только completion_report или любой payload; warnings.unknownTaskKeys в v1; минимальный путь MCP. Зафиксировать в PRD/ADR.\n\nPRD: docs/PRD-message-task-linking.md",
    priority: "HIGH",
  },
  {
    title: "E10-S1: ADR + схема БД (junction, RLS, CASCADE)",
    description:
      "ADR или дополнение architecture.md: MessageTaskLink (или эквивалент), уникальность (messageId, taskId), индексы, RLS, каскады при удалении Task/Message.\n\nPRD §12 фаза 1.",
    priority: "HIGH",
  },
  {
    title: "E10-S2: Prisma миграция (без backfill)",
    description:
      "Модель и миграция в packages/db. Исторические сообщения не перелинковываем в v1.\n\nPRD §12 фаза 1.2.",
    priority: "HIGH",
  },
  {
    title: "E10-S3: Хук создания сообщения — tasksTouched → связи",
    description:
      "После Message.create: парсинг payload.tasksTouched, разрешение Task по (projectId, key), идемпотентный upsert; неизвестные ключи — skip.\n\nPRD FR1–FR2, §12 фаза 2.1.",
    priority: "HIGH",
  },
  {
    title: "E10-S4: API «сообщения по задаче» (taskId / key)",
    description:
      "GET с фильтрами; ответ: id, threadId, createdAt, fromAgentId, опционально preview.\n\nPRD FR3, §12 фаза 2.2.",
    priority: "MEDIUM",
  },
  {
    title: "E10-S5: API «задачи по сообщению» (includeLinkedTasks)",
    description:
      "Флаг или вложение в GET сообщения / списке треда: id, key, title, state.\n\nPRD FR4, §12 фаза 2.3.",
    priority: "MEDIUM",
  },
  {
    title: "E10-S6: Наблюдаемость (FR6)",
    description:
      "Метрики/логи: сообщения с непустым tasksTouched, разрешённые и пропущенные ключи, без PII.\n\nPRD FR6.",
    priority: "LOW",
  },
  {
    title: "E10-S7: UI — блок «сообщения» на деталях задачи",
    description:
      "Список связанных сообщений + ссылка в тред; empty state.\n\nPRD FR5, §12 фаза 3.1.",
    priority: "MEDIUM",
  },
  {
    title: "E10-S8: UI — чипы задач в сообщении/треде",
    description:
      "Ссылки на детали задачи по key.\n\nPRD FR5, §12 фаза 3.2.",
    priority: "MEDIUM",
  },
  {
    title: "E10-S9: SDK / OpenAPI под новые эндпоинты",
    description: "packages/sdk, типы и методы.\n\nPRD §12 фаза 4.",
    priority: "LOW",
  },
  {
    title: "E10-S10: MCP — минимальное расширение",
    description:
      "По решению фазы 0: tool или расширение get_thread_messages / task tools.\n\nPRD §12 фаза 5.",
    priority: "LOW",
  },
  {
    title: "E10-S11: E2E + обновление правил агентов",
    description:
      "E2E по AC §9; .cursor/rules/mcp-message-bus.md — непустой tasksTouched материализуется на сервере.\n\nPRD §12 фаза 6.",
    priority: "MEDIUM",
  },
];

async function findEpicByTitle(title) {
  const { data } = await api("GET", `/projects/${PROJECT_ID}/epics`, undefined);
  return data?.find((e) => e.title === title) ?? null;
}

async function findSprintByName(name) {
  const { data } = await api("GET", `/projects/${PROJECT_ID}/sprints`, undefined);
  return data?.find((s) => s.name === name) ?? null;
}

async function listAllTasks() {
  const { data } = await api("GET", `/projects/${PROJECT_ID}/tasks`, undefined);
  return Array.isArray(data) ? data : [];
}

async function main() {
  let epic = await findEpicByTitle(EPIC_TITLE);
  if (!epic) {
    const created = await api("POST", `/projects/${PROJECT_ID}/epics`, {
      title: EPIC_TITLE,
      description:
        "Материализация связи Message ↔ Task по payload.tasksTouched. PRD: docs/PRD-message-task-linking.md §12.",
      status: "IN_PROGRESS",
    });
    epic = created.data;
    console.log("Создан эпик:", epic.id, epic.title);
  } else {
    console.log("Эпик уже есть:", epic.id, epic.title);
  }

  let sprint = await findSprintByName(SPRINT_NAME);
  if (!sprint) {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 21);
    const created = await api("POST", `/projects/${PROJECT_ID}/sprints`, {
      name: SPRINT_NAME,
      goal: "Закрыть E10 по PRD message-task linking (v1).",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
    sprint = created.data;
    console.log("Создан спринт:", sprint.id, sprint.name);
  } else {
    console.log("Спринт уже есть:", sprint.id, sprint.name);
  }

  const byTitle = new Map((await listAllTasks()).map((t) => [t.title, t]));
  const keys = [];

  for (const t of TASKS) {
    let task = byTitle.get(t.title);
    if (!task) {
      const created = await api("POST", `/projects/${PROJECT_ID}/tasks`, {
        title: t.title,
        description: t.description,
        state: "BACKLOG",
        priority: t.priority,
        epicId: epic.id,
        sprintId: sprint.id,
      });
      task = created.data;
      byTitle.set(t.title, task);
      console.log("Создана задача:", task.key, task.title);
    } else {
      const needEpic = task.epicId !== epic.id;
      const needSprint = task.sprintId !== sprint.id;
      if (needEpic || needSprint) {
        await api("PATCH", `/projects/${PROJECT_ID}/tasks/${task.id}`, {
          ...(needEpic ? { epicId: epic.id } : {}),
          ...(needSprint ? { sprintId: sprint.id } : {}),
        });
        console.log("Обновлены epic/sprint:", task.key, task.title);
      } else {
        console.log("Уже есть:", task.key, task.title);
      }
    }
    keys.push(task.key);
  }

  console.log("\nГотово. Ключи:", keys.join(", "));
  console.log("Эпик:", epic.id, "| Спринт:", sprint.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
