import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { BookOpenIcon, Info, KeyboardIcon, Link2Icon, Plug } from "lucide-react";
import { Button } from "@amb-app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@amb-app/ui/components/card";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderTitle,
} from "@amb-app/ui/components/page-header";
import { McpConfigCards } from "@/components/help/mcp-config-cards";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Help — Agent Message Bus",
  description: "About the project, connecting a new project, keyboard shortcuts and documentation",
};

const shortcuts = [
  { keys: "⌘K / Ctrl+K", descriptionKey: "shortcutCommandPalette" },
  { keys: "?", descriptionKey: "shortcutShowPalette" },
  { keys: "1", descriptionKey: "shortcutTabMessages" },
  { keys: "2", descriptionKey: "shortcutTabInbox" },
  { keys: "3", descriptionKey: "shortcutTabErrors" },
  { keys: "N", descriptionKey: "shortcutNewThread" },
  { keys: "R", descriptionKey: "shortcutRefresh" },
  { keys: "/", descriptionKey: "shortcutFocusSearch" },
  { keys: "Enter", descriptionKey: "shortcutSendMessage" },
];

export default async function HelpPage() {
  const t = await getTranslations("Help");

  return (
    <div className="tasks-workspace-surface amb-glass-surface amb-shell-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-5 py-4 md:px-6">
        <PageHeader className="max-w-5xl border-b-0 pb-0">
          <PageHeaderContent>
            <PageHeaderEyebrow>{t("title")}</PageHeaderEyebrow>
            <PageHeaderTitle className="font-display text-lg sm:text-xl">{t("title")}</PageHeaderTitle>
            <PageHeaderDescription>
              {t("about")} · {t("connectingProject")} · {t("keyboardShortcuts")} · {t("links")}
            </PageHeaderDescription>
          </PageHeaderContent>
        </PageHeader>
      </div>

      <main className="tasks-workspace-inner min-h-0 min-w-0 flex-1 overflow-auto">
        <div className="max-w-5xl space-y-8 px-5 py-4 md:px-6 md:py-5">
          <Card className="shadow-elevation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="size-5" />
              {t("about")}
            </CardTitle>
            <CardDescription>
              Agent Message Bus — local message bus for AI agents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              The system lets AI agents exchange messages via threads,
              track delivery (inbox / ACK) and handle errors (retry / DLQ).
            </p>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">{t("keyConcepts")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  { term: "Agent", def: "System participant with a name and role (po, dev, qa, architect…)." },
                  { term: "Thread", def: "Named container for a conversation. One thread — one task." },
                  { term: "Message", def: "JSON payload from one agent to another within a thread." },
                  { term: "Inbox", def: "Agent's incoming message queue. Polling every 2–5 sec." },
                  { term: "ACK", def: "Message processing confirmation. Without ACK — retry." },
                  { term: "DLQ", def: "Dead Letter Queue — messages that exhausted delivery attempts." },
                ].map(({ term, def }) => (
                  <li key={term} className="flex gap-2">
                    <span className="font-mono text-foreground shrink-0">{term}</span>
                    <span>— {def}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">{t("messageLifecycle")}</h3>
              <div className="font-mono text-xs text-muted-foreground bg-muted rounded-md px-4 py-3">
                pending → delivered → ack
                <br />
                pending → failed → dlq
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className="shadow-elevation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="size-5" />
              {t("connectingProject")}
            </CardTitle>
            <CardDescription>
              How to connect another repository to Message Bus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-3">
              <h3 className="text-sm font-semibold">Quick start (basic scenario)</h3>
              <p className="text-sm text-muted-foreground">
                The new project already has <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/agents</code> (like here), possibly a monorepo (Turborepo). Goal: let Cursor agents use AMB threads and messages.
              </p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  <strong className="text-foreground">Start AMB.</strong> In this repo: <code className="rounded bg-muted px-1 font-mono text-xs">pnpm dev</code> (and separately — PostgreSQL, migrations, and if needed <code className="rounded bg-muted px-1 font-mono text-xs">pnpm seed:agents</code>). Or run AMB via Docker.
                </li>
                <li>
                  <strong className="text-foreground">In the new project</strong> (repo root or Turborepo root) add the Message Bus MCP server: in Cursor → MCP settings set <code className="rounded bg-muted px-1 font-mono text-xs">command</code> = <code className="rounded bg-muted px-1 font-mono text-xs">node</code>, <code className="rounded bg-muted px-1 font-mono text-xs">args</code> = <code className="rounded bg-muted px-1 font-mono text-xs">[&quot;/absolute/path/to/amb/packages/mcp-server/dist/index.js&quot;]</code>, <code className="rounded bg-muted px-1 font-mono text-xs">env.MESSAGE_BUS_URL</code> = <code className="rounded bg-muted px-1 font-mono text-xs">http://localhost:3333</code>.
                </li>
                <li>
                  Restart Cursor or reconnect MCP. Done: you can create threads, send messages, and view inbox via Message Bus tools in chat.
                </li>
              </ol>
              <p className="text-xs text-muted-foreground">
                If the new project has its own agent list (its own <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/agents/registry.json</code>) and you want them in AMB — register them via <code className="rounded bg-muted px-1 font-mono text-xs">POST /api/agents</code> or copy and run <code className="rounded bg-muted px-1 font-mono text-xs">scripts/seed-agents.ts</code> with your registry.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              One running Message Bus instance can serve multiple projects.
              They all connect to the same URL (e.g. <code className="rounded bg-muted px-1 font-mono text-xs">http://localhost:3333</code>) and share agents, threads and messages.
            </p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Option 1: HTTP API</h3>
              <p className="text-sm text-muted-foreground">
                Ensure Message Bus is running (<code className="rounded bg-muted px-1 font-mono text-xs">pnpm dev</code> or Docker). Call endpoints from your app:
              </p>
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto">
{`GET  http://localhost:3333/api/agents
POST http://localhost:3333/api/threads
POST http://localhost:3333/api/messages/send
GET  http://localhost:3333/api/messages/inbox?agentId=...`}
              </pre>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Option 2: TypeScript SDK</h3>
              <p className="text-sm text-muted-foreground">
                Copy the <code className="rounded bg-muted px-1 font-mono text-xs">lib/sdk</code> folder into your project and create a client:
              </p>
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto">
{`import { createClient } from "./lib/message-bus-sdk";

const client = createClient("http://localhost:3333");
const agent = await client.registerAgent({ name: "my-service", role: "worker" });`}
              </pre>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Option 3: MCP (Cursor, Claude Desktop, etc.)</h3>
              <p className="text-sm text-muted-foreground">
                In your editor/client MCP settings, set the path to <code className="rounded bg-muted px-1 font-mono text-xs">packages/mcp-server/dist/index.js</code> and the <code className="rounded bg-muted px-1 font-mono text-xs">MESSAGE_BUS_URL</code> variable. Then AI agents in this project can use Message Bus tools (create threads, send messages, inbox, ack).
              </p>
            </div>

            <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold">{t("singleProjectSetupTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("singleProjectSetupDesc")}</p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>{t("singleProjectSetupStep1")}</li>
                <li>{t("singleProjectSetupStep2")}</li>
                <li>{t("singleProjectSetupStep3")}</li>
              </ol>

              <McpConfigCards />
            </div>

            <div className="space-y-2 rounded-md border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold">Multiple projects</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  <strong className="text-foreground">One instance for all projects</strong> — all repos point to the same URL (localhost:3333). Agents and threads are shared. Handy for local dev and a single team.
                </li>
                <li>
                  <strong className="text-foreground">Separate instance per project</strong> — run multiple Message Bus copies on different ports (e.g. 3333, 3334) and/or databases. Each project connects to its own URL. Use when you need data isolation between projects.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

          <Card className="shadow-elevation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyboardIcon className="size-5" />
              {t("keyboardShortcuts")}
            </CardTitle>
            <CardDescription>
              Work when focus is not in an input. Shortcuts are disabled in inputs (search, message).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {shortcuts.map(({ keys, descriptionKey }) => (
                <li
                  key={keys}
                  className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0"
                >
                  <span className="text-muted-foreground">{t(descriptionKey)}</span>
                  <kbd className="rounded border bg-muted px-2 py-1 font-mono text-sm">
                    {keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-elevation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2Icon className="size-5" />
              {t("links")}
            </CardTitle>
            <CardDescription>
              Documentation and API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href="http://localhost:3333/ru/help" target="_blank" rel="noopener noreferrer">
                    <Link2Icon className="size-4" />
                    {t("localHelpRu")}
                  </a>
                </Button>
              </li>
              <li>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/help/use-cases">
                    <BookOpenIcon className="size-4" />
                    {t("useCases")}
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href="/api-docs" target="_blank" rel="noopener noreferrer">
                    <BookOpenIcon className="size-4" />
                    {t("apiDocs")}
                  </a>
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
