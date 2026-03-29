/**
 * Создаёт 5 демо-задач тем же HTTP-вызовом, что и MCP `create_task`
 * (POST /api/projects/:projectId/tasks + заголовок x-project-id).
 *
 * Запуск из корня монорепо:
 *   pnpm --filter amb-web exec tsx scripts/mcp-demo-tasks.ts
 *
 * Переменные (как в .cursor/mcp.json):
 *   MESSAGE_BUS_URL, MESSAGE_BUS_PROJECT_ID
 */
import "dotenv/config";

const PROJECT_ID =
  process.env.MESSAGE_BUS_PROJECT_ID?.trim() ??
  "70275f6d-2528-40b1-9dc3-266cdb72ddfc";

const BASE_URL = (process.env.MESSAGE_BUS_URL ?? process.env.API_URL ?? "http://localhost:3334").replace(
  /\/$/,
  ""
);

const tasks: Array<{
  title: string;
  description: string;
  state: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
  priority: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}> = [
  {
    title: "[MCP Demo] Smoke: вход и проект",
    description: "Проверка логина и переключения проекта после сидов.",
    state: "TODO",
    priority: "HIGH",
  },
  {
    title: "[MCP Demo] Список задач и фильтры",
    description: "Убедиться, что новые задачи видны в списке и Kanban.",
    state: "IN_PROGRESS",
    priority: "MEDIUM",
  },
  {
    title: "[MCP Demo] Эпик / спринт (связи)",
    description: "При необходимости вручную привязать к эпику в UI.",
    state: "BACKLOG",
    priority: "LOW",
  },
  {
    title: "[MCP Demo] Inbox агента",
    description: "Открыть inbox и убедиться, что сообщения доставляются.",
    state: "TODO",
    priority: "URGENT",
  },
  {
    title: "[MCP Demo] DLQ и повтор",
    description: "Проверить экран DLQ при наличии ошибок доставки.",
    state: "BACKLOG",
    priority: "NONE",
  },
];

async function main() {
  const url = `${BASE_URL}/api/projects/${PROJECT_ID}/tasks`;
  console.log(`POST → ${url}`);
  console.log(`x-project-id: ${PROJECT_ID}\n`);

  for (const body of tasks) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": PROJECT_ID,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`❌ ${body.title}\n   ${res.status} ${text}`);
      process.exitCode = 1;
      return;
    }
    const json = JSON.parse(text) as { data: { id: string; key?: string } };
    console.log(`✅ ${json.data.key ?? json.data.id} — ${body.title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
