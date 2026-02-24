import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  Info,
  KeyboardIcon,
  Link2Icon,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Помощь — Agent Message Bus",
  description: "О проекте, подключение нового проекта, горячие клавиши и документация",
};

const shortcuts = [
  { keys: "⌘K / Ctrl+K", description: "Командная палитра" },
  { keys: "?", description: "Показать палитру (вне поля ввода)" },
  { keys: "1", description: "Вкладка «Сообщения»" },
  { keys: "2", description: "Вкладка «Входящие»" },
  { keys: "3", description: "Вкладка «Ошибки» (DLQ)" },
  { keys: "N", description: "Новый тред" },
  { keys: "R", description: "Обновить страницу" },
  { keys: "/", description: "Фокус в поиск" },
  { keys: "Enter", description: "Отправить сообщение (в поле ввода сообщения)" },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              На главную
            </Link>
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">Помощь</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="size-5" />
              О проекте
            </CardTitle>
            <CardDescription>
              Agent Message Bus — локальная шина сообщений для AI-агентов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Система позволяет AI-агентам обмениваться сообщениями через треды,
              отслеживать доставку (inbox / ACK) и обрабатывать ошибки (retry / DLQ).
            </p>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Ключевые концепции</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  {
                    term: "Агент",
                    def: "Участник системы с именем и ролью (po, dev, qa, architect…).",
                  },
                  {
                    term: "Тред",
                    def: "Именованный контейнер для переписки. Один тред — одна задача.",
                  },
                  {
                    term: "Сообщение",
                    def: "JSON-payload от одного агента другому внутри треда.",
                  },
                  {
                    term: "Inbox",
                    def: "Очередь входящих сообщений агента. Polling каждые 2–5 сек.",
                  },
                  {
                    term: "ACK",
                    def: "Подтверждение обработки сообщения. Без ACK — retry.",
                  },
                  {
                    term: "DLQ",
                    def: "Dead Letter Queue — сообщения, исчерпавшие попытки доставки.",
                  },
                ].map(({ term, def }) => (
                  <li key={term} className="flex gap-2">
                    <span className="font-mono text-foreground shrink-0">{term}</span>
                    <span>— {def}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Жизненный цикл сообщения</h3>
              <div className="font-mono text-xs text-muted-foreground bg-muted rounded-md px-4 py-3">
                pending → delivered → ack
                <br />
                pending → failed → dlq
              </div>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="size-5" />
              Подключение нового проекта
            </CardTitle>
            <CardDescription>
              Как подключить другой репозиторий к Message Bus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-3">
              <h3 className="text-sm font-semibold">Кратчайший путь (базовый сценарий)</h3>
              <p className="text-sm text-muted-foreground">
                В новом проекте уже есть <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/agents</code> (как здесь), возможно monorepo (Turborepo). Цель — чтобы агенты в Cursor могли пользоваться тредами и сообщениями AMB.
              </p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  <strong className="text-foreground">Запустите AMB.</strong> В этом репозитории: <code className="rounded bg-muted px-1 font-mono text-xs">pnpm dev</code> (и отдельно — PostgreSQL, миграции, при необходимости <code className="rounded bg-muted px-1 font-mono text-xs">pnpm seed:agents</code>). Либо поднимите AMB через Docker.
                </li>
                <li>
                  <strong className="text-foreground">В новом проекте</strong> (корень репо или корень Turborepo) добавьте MCP-сервер Message Bus: в настройках Cursor → MCP укажите <code className="rounded bg-muted px-1 font-mono text-xs">command</code> = <code className="rounded bg-muted px-1 font-mono text-xs">node</code>, <code className="rounded bg-muted px-1 font-mono text-xs">args</code> = <code className="rounded bg-muted px-1 font-mono text-xs">["/абсолютный/путь/к/mcp-message-bus/mcp-server/dist/index.js"]</code>, <code className="rounded bg-muted px-1 font-mono text-xs">env.MESSAGE_BUS_URL</code> = <code className="rounded bg-muted px-1 font-mono text-xs">http://localhost:3333</code>.
                </li>
                <li>
                  Перезапустите Cursor или переподключите MCP. Готово: в чате можно создавать треды, отправлять сообщения, смотреть inbox через инструменты Message Bus.
                </li>
              </ol>
              <p className="text-xs text-muted-foreground">
                Если в новом проекте свой список агентов (свой <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/agents/registry.json</code>) и вы хотите видеть их в AMB — зарегистрируйте их через <code className="rounded bg-muted px-1 font-mono text-xs">POST /api/agents</code> или скопируйте и запустите скрипт <code className="rounded bg-muted px-1 font-mono text-xs">scripts/seed-agents.ts</code>, подставив свой registry.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Один запущенный экземпляр Message Bus может обслуживать несколько проектов.
              Все они подключаются к одному URL (например, <code className="rounded bg-muted px-1 font-mono text-xs">http://localhost:3333</code>) и используют общих агентов, треды и сообщения.
            </p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Способ 1: HTTP API</h3>
              <p className="text-sm text-muted-foreground">
                Убедитесь, что Message Bus запущен (<code className="rounded bg-muted px-1 font-mono text-xs">pnpm dev</code> или Docker). Из своего приложения вызывайте эндпоинты:
              </p>
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto">
{`GET  http://localhost:3333/api/agents
POST http://localhost:3333/api/threads
POST http://localhost:3333/api/messages/send
GET  http://localhost:3333/api/messages/inbox?agentId=...`}
              </pre>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Способ 2: TypeScript SDK</h3>
              <p className="text-sm text-muted-foreground">
                Скопируйте папку <code className="rounded bg-muted px-1 font-mono text-xs">lib/sdk</code> в свой проект и создавайте клиент:
              </p>
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto">
{`import { createClient } from "./lib/message-bus-sdk";

const client = createClient("http://localhost:3333");
const agent = await client.registerAgent({ name: "my-service", role: "worker" });`}
              </pre>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Способ 3: MCP (Cursor, Claude Desktop и др.)</h3>
              <p className="text-sm text-muted-foreground">
                В настройках MCP вашего редактора/клиента укажите путь к <code className="rounded bg-muted px-1 font-mono text-xs">mcp-server/dist/index.js</code> и переменную <code className="rounded bg-muted px-1 font-mono text-xs">MESSAGE_BUS_URL</code>. Тогда AI-агенты в этом проекте смогут вызывать инструменты Message Bus (создание тредов, отправка сообщений, inbox, ack).
              </p>
            </div>

            <div className="space-y-2 rounded-md border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold">Несколько проектов</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  <strong className="text-foreground">Один экземпляр на все проекты</strong> — все репозитории указывают на один и тот же URL (localhost:3333). Агенты и треды общие. Удобно для локальной разработки и одной команды.
                </li>
                <li>
                  <strong className="text-foreground">Отдельный экземпляр на проект</strong> — запустите несколько копий Message Bus на разных портах (например, 3333, 3334) и/или с разными базами данных. Каждый проект подключается к своему URL. Подходит, если нужна изоляция данных между проектами.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyboardIcon className="size-5" />
              Горячие клавиши
            </CardTitle>
            <CardDescription>
              Работают, когда фокус не в поле ввода. В полях ввода (поиск, сообщение) горячие клавиши отключены.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {shortcuts.map(({ keys, description }) => (
                <li
                  key={keys}
                  className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0"
                >
                  <span className="text-muted-foreground">{description}</span>
                  <kbd className="rounded border bg-muted px-2 py-1 font-mono text-sm">
                    {keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2Icon className="size-5" />
              Ссылки
            </CardTitle>
            <CardDescription>
              Документация и API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/help/use-cases">
                    <BookOpenIcon className="size-4" />
                    Сценарии использования AMB
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/api-docs" target="_blank" rel="noopener noreferrer">
                    <BookOpenIcon className="size-4" />
                    Документация API (Swagger)
                  </Link>
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
