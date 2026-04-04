import type { Metadata } from "next";
import { BookOpenIcon, Link2Icon, ListOrderedIcon, NetworkIcon, UserIcon, WorkflowIcon } from "lucide-react";
import { Button } from "@amb-app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@amb-app/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@amb-app/ui/components/table";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderTitle,
} from "@amb-app/ui/components/page-header";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Use cases — Help | Agent Message Bus",
  description: "All AMB use cases: connection, message flows, roles, typical scenarios",
};

const connectionTable = [
  { way: "REST API (curl / fetch)", who: "Scripts, external services, debugging", desc: "Direct HTTP requests to /api/*." },
  { way: "TypeScript SDK", who: "Apps, workers, orchestration", desc: "createClient(baseUrl): agents, threads, sendMessage, pollInbox, ACK, DLQ." },
  { way: "MCP (Cursor, etc.)", who: "AI agents in Cursor", desc: "list_agents, create_thread, send_message, get_inbox, ack_message, get_dlq." },
  { way: "Dashboard UI", who: "Developer, observer", desc: "Monitor agents, threads, inbox, DLQ, manual retry." },
  { way: "AMB in Docker", who: "Another application", desc: "docker compose up -d; app talks to localhost:3333." },
  { way: "Copy SDK", who: "Your project", desc: "cp -r lib/sdk your-project/... and createClient(url)." },
];

const flowTable = [
  { scenario: "Point-to-point", desc: "Message to one recipient (toAgentId set).", how: "sendMessage({ ..., toAgentId: targetId, payload })." },
  { scenario: "Broadcast", desc: "One message visible to every agent.", how: "sendMessage({ ..., toAgentId: null, payload })." },
  { scenario: "Reply chain", desc: "Reply to a message (parent–child).", how: "sendMessage({ ..., parentId: incoming.id, payload })." },
  { scenario: "Sequential workflow", desc: "Orchestrator sends tasks step by step (PO → Architect → Dev → QA).", how: "createThread → loop sendMessage. Example: pnpm orchestrator." },
  { scenario: "Polling inbox", desc: "Worker periodically fetches incoming.", how: "for await (const msgs of client.pollInbox(agentId)) { ... ackMessage(id) }." },
  { scenario: "Retry and DLQ", desc: "Retry undelivered, view DLQ.", how: "POST /api/dlq/:id/retry, retryAllDLQ(), Dashboard." },
  { scenario: "Close thread", desc: "Thread marked as completed.", how: "PATCH /api/threads/:id { status: \"closed\" }." },
];

const roleTable = [
  { role: "Developer (local)", goal: "Run the bus, debug agents.", actions: "pnpm dev, create a project in the Dashboard, API/SDK, examples/." },
  { role: "Developer (integration)", goal: "Integrate AMB into a service or script.", actions: "HTTP, SDK or MCP in your code." },
  { role: "AI agent in Cursor", goal: "Execute tasks via the bus.", actions: "MCP: create_thread, send_message, get_inbox, ack_message." },
  { role: "Orchestrator (script)", goal: "Agent chains, pipelines.", actions: "SDK: createThread, loop sendMessage, wait for replies." },
  { role: "Observer", goal: "System state, threads, DLQ.", actions: "Dashboard: agents, threads, inbox, DLQ, retry." },
];

const summaryTable = [
  { scenario: "Local development", connection: "REST + Dashboard", ops: "Create thread, send, view inbox/DLQ" },
  { scenario: "App integration", connection: "SDK or REST", ops: "registerAgent, createThread, sendMessage, pollInbox, ackMessage" },
  { scenario: "AI agents in Cursor", connection: "MCP", ops: "create_thread, send_message, get_inbox, ack_message" },
  { scenario: "Step-by-step orchestration", connection: "SDK (script)", ops: "createThread → loop sendMessage by role" },
  { scenario: "Agent worker", connection: "SDK", ops: "pollInbox, handle by payload.type, ackMessage" },
  { scenario: "Broadcast", connection: "SDK / REST / MCP", ops: "sendMessage with toAgentId: null" },
  { scenario: "Reply in thread", connection: "SDK / REST / MCP", ops: "sendMessage with parentId" },
  { scenario: "Working with DLQ", connection: "Dashboard / REST / SDK", ops: "getDLQ, retryDLQMessage, retryAllDLQ" },
  { scenario: "AMB as a service", connection: "HTTP from app", ops: "Any scenario via AMB URL" },
];

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Record<string, string>[];
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {headers.map((h) => (
              <TableHead key={h} className="px-4">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {headers.map((h) => (
                <TableCell key={h} className="px-4 align-top text-muted-foreground whitespace-normal">
                  {row[h]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function UseCasesPage() {
  const t = await getTranslations("Help");

  return (
    <div className="tasks-workspace-surface amb-glass-surface amb-shell-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-5 py-4 md:px-6">
        <PageHeader className="max-w-5xl border-b-0 pb-0">
          <PageHeaderContent>
            <PageHeaderEyebrow>{t("title")}</PageHeaderEyebrow>
            <PageHeaderTitle className="font-display text-lg sm:text-xl">{t("useCases")}</PageHeaderTitle>
            <PageHeaderDescription>
              Типовые сценарии использования, способы подключения и поддерживаемые message flows.
            </PageHeaderDescription>
          </PageHeaderContent>
        </PageHeader>
      </div>

      <main className="tasks-workspace-inner min-h-0 min-w-0 flex-1 overflow-auto">
        <div className="max-w-5xl space-y-8 px-5 py-4 md:px-6 md:py-5">
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NetworkIcon className="size-5" />
              By connection method
            </CardTitle>
            <CardDescription>How clients connect to the bus</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              headers={["Method", "Who uses", "Description"]}
              rows={connectionTable.map((r) => ({
                Method: r.way,
                "Who uses": r.who,
                Description: r.desc,
              }))}
            />
          </CardContent>
        </Card>

          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WorkflowIcon className="size-5" />
              By message flow type
            </CardTitle>
            <CardDescription>Point-to-point, broadcast, workflow, DLQ, etc.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              headers={["Scenario", "Description", "How to implement"]}
              rows={flowTable.map((r) => ({
                Scenario: r.scenario,
                Description: r.desc,
                "How to implement": r.how,
              }))}
            />
          </CardContent>
        </Card>

          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="size-5" />
              By user role
            </CardTitle>
            <CardDescription>Who does what</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              headers={["Role", "Goal", "Typical actions"]}
              rows={roleTable.map((r) => ({
                Role: r.role,
                Goal: r.goal,
                "Typical actions": r.actions,
              }))}
            />
          </CardContent>
        </Card>

          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListOrderedIcon className="size-5" />
              Step-by-step scenarios
            </CardTitle>
            <CardDescription>Summary: registration, MCP, broadcast, workflow, worker, DLQ, Docker</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              <h4 className="mb-1 font-medium text-foreground">Agent registration and first message (SDK)</h4>
              <p>Start AMB → createClient → registerAgent → createThread → sendMessage. Recipient: getInbox / pollInbox → process → ackMessage.</p>
            </div>
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              <h4 className="mb-1 font-medium text-foreground">Task from Cursor (MCP)</h4>
              <p>In chat: &quot;Create a thread and send a task to the dev agent&quot;. AI calls create_thread → list_agents → send_message.</p>
            </div>
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              <h4 className="mb-1 font-medium text-foreground">Broadcast</h4>
              <p>sendMessage with toAgentId: null — every agent sees the message in inbox.</p>
            </div>
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              <h4 className="mb-1 font-medium text-foreground">Workflow PO → Architect → Dev → QA</h4>
              <p>Script: create thread, sendMessage by role step by step, optionally wait for reply, close thread. Example: pnpm orchestrator.</p>
            </div>
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              <h4 className="mb-1 font-medium text-foreground">Agent worker</h4>
              <p>pollInbox(agentId) in a loop, handle by payload.type, ackMessage. On failure — retry/DLQ.</p>
            </div>
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              <h4 className="mb-1 font-medium text-foreground">Monitoring and DLQ</h4>
              <p>Dashboard or GET /api/dlq → retry one or retry-all via API / client.retryDLQMessage / retryAllDLQ.</p>
            </div>
            <div className="rounded-lg border p-4 text-sm text-muted-foreground md:col-span-2">
              <h4 className="mb-1 font-medium text-foreground">AMB as a service</h4>
              <p>docker compose up -d; your app connects over HTTP or via SDK to the AMB URL.</p>
            </div>
          </CardContent>
        </Card>

          <Card>
          <CardHeader>
            <CardTitle>Summary table</CardTitle>
            <CardDescription>Scenario → connection → main operations</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              headers={["Scenario", "Connection", "Main operations"]}
              rows={summaryTable.map((r) => ({
                Scenario: r.scenario,
                Connection: r.connection,
                "Main operations": r.ops,
              }))}
            />
          </CardContent>
        </Card>

          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2Icon className="size-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
                  <a href="/api-docs" target="_blank" rel="noopener noreferrer">
                    <BookOpenIcon className="size-4" />
                    {t("apiDocs")}
                  </a>
                </Button>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Full scenarios in the repo: <code className="rounded bg-muted px-1">docs/product/use-cases.md</code>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
