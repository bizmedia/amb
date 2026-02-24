import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  Link2Icon,
  ListOrderedIcon,
  NetworkIcon,
  UserIcon,
  WorkflowIcon,
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
  title: "Сценарии использования — Помощь | Agent Message Bus",
  description: "Все варианты применения AMB: подключение, потоки сообщений, роли, типовые сценарии",
};

const connectionTable = [
  { way: "REST API (curl / fetch)", who: "Скрипты, внешние сервисы, отладка", desc: "Прямые HTTP-запросы к /api/*." },
  { way: "TypeScript SDK", who: "Приложения, воркеры, оркестрация", desc: "createClient(baseUrl): агенты, треды, sendMessage, pollInbox, ACK, DLQ." },
  { way: "MCP (Cursor и др.)", who: "ИИ-агенты в Cursor", desc: "list_agents, create_thread, send_message, get_inbox, ack_message, get_dlq." },
  { way: "Dashboard UI", who: "Разработчик, наблюдатель", desc: "Мониторинг агентов, тредов, inbox, DLQ, ручной retry." },
  { way: "AMB в Docker", who: "Другое приложение", desc: "docker compose up -d; приложение ходит на localhost:3333." },
  { way: "Копирование SDK", who: "Свой проект", desc: "cp -r lib/sdk your-project/... и createClient(url)." },
];

const flowTable = [
  { scenario: "Точка–точка", desc: "Сообщение одному получателю (toAgentId задан).", how: "sendMessage({ ..., toAgentId: targetId, payload })." },
  { scenario: "Broadcast", desc: "Одно сообщение видит каждый агент.", how: "sendMessage({ ..., toAgentId: null, payload })." },
  { scenario: "Цепочка ответов", desc: "Ответ на сообщение (родитель–потомок).", how: "sendMessage({ ..., parentId: incoming.id, payload })." },
  { scenario: "Последовательный workflow", desc: "Оркестратор шлёт задачи по шагам (PO → Architect → Dev → QA).", how: "createThread → цикл sendMessage. Пример: pnpm orchestrator." },
  { scenario: "Polling inbox", desc: "Воркер периодически забирает входящие.", how: "for await (const msgs of client.pollInbox(agentId)) { ... ackMessage(id) }." },
  { scenario: "Retry и DLQ", desc: "Повтор недоставленных, просмотр DLQ.", how: "POST /api/dlq/:id/retry, retryAllDLQ(), Dashboard." },
  { scenario: "Закрытие треда", desc: "Тред помечен как завершённый.", how: "PATCH /api/threads/:id { status: \"closed\" }." },
];

const roleTable = [
  { role: "Разработчик (локально)", goal: "Запустить шину, отладить агентов.", actions: "pnpm dev, seed:agents, API/SDK, examples/." },
  { role: "Разработчик (интеграция)", goal: "Встроить AMB в сервис или скрипт.", actions: "HTTP, SDK или MCP в своём коде." },
  { role: "ИИ-агент в Cursor", goal: "Выполнять задачи через шину.", actions: "MCP: create_thread, send_message, get_inbox, ack_message." },
  { role: "Оркестратор (скрипт)", goal: "Цепочка агентов, пайплайны.", actions: "SDK: createThread, цикл sendMessage, ожидание ответов." },
  { role: "Наблюдатель", goal: "Состояние системы, тредов, DLQ.", actions: "Dashboard: агенты, треды, inbox, DLQ, retry." },
];

const summaryTable = [
  { scenario: "Локальная разработка", connection: "REST + Dashboard", ops: "Создание треда, отправка, просмотр inbox/DLQ" },
  { scenario: "Интеграция приложения", connection: "SDK или REST", ops: "registerAgent, createThread, sendMessage, pollInbox, ackMessage" },
  { scenario: "ИИ-агенты в Cursor", connection: "MCP", ops: "create_thread, send_message, get_inbox, ack_message" },
  { scenario: "Оркестрация по шагам", connection: "SDK (скрипт)", ops: "createThread → цикл sendMessage по ролям" },
  { scenario: "Воркер агента", connection: "SDK", ops: "pollInbox, обработка по payload.type, ackMessage" },
  { scenario: "Broadcast", connection: "SDK / REST / MCP", ops: "sendMessage с toAgentId: null" },
  { scenario: "Ответ в треде", connection: "SDK / REST / MCP", ops: "sendMessage с parentId" },
  { scenario: "Работа с DLQ", connection: "Dashboard / REST / SDK", ops: "getDLQ, retryDLQMessage, retryAllDLQ" },
  { scenario: "AMB как сервис", connection: "HTTP из приложения", ops: "Любые сценарии по URL AMB" },
];

function Table({
  headers,
  rows,
  className = "",
}: {
  headers: string[];
  rows: Record<string, string>[];
  className?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0">
              {headers.map((h) => (
                <td key={h} className="px-4 py-2 text-muted-foreground">
                  {row[h]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/help">
              <ArrowLeftIcon className="size-4" />
              К разделу «Помощь»
            </Link>
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">Сценарии использования AMB</h1>
          <div className="w-28" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <p className="text-muted-foreground text-sm">
          Все возможные варианты применения AMB: кто использует, как подключается и какие потоки сообщений поддерживаются.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NetworkIcon className="size-5" />
              По способу подключения
            </CardTitle>
            <CardDescription>Как клиенты подключаются к шине</CardDescription>
          </CardHeader>
          <CardContent>
            <Table
              headers={["Способ", "Кто использует", "Описание"]}
              rows={connectionTable.map((r) => ({
                Способ: r.way,
                "Кто использует": r.who,
                Описание: r.desc,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WorkflowIcon className="size-5" />
              По типу потока сообщений
            </CardTitle>
            <CardDescription>Точка–точка, broadcast, workflow, DLQ и др.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table
              headers={["Сценарий", "Описание", "Как реализовать"]}
              rows={flowTable.map((r) => ({
                Сценарий: r.scenario,
                Описание: r.desc,
                "Как реализовать": r.how,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="size-5" />
              По роли пользователя
            </CardTitle>
            <CardDescription>Кто что делает</CardDescription>
          </CardHeader>
          <CardContent>
            <Table
              headers={["Роль", "Цель", "Типичные действия"]}
              rows={roleTable.map((r) => ({
                Роль: r.role,
                Цель: r.goal,
                "Типичные действия": r.actions,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListOrderedIcon className="size-5" />
              Типовые сценарии по шагам
            </CardTitle>
            <CardDescription>Кратко: регистрация, MCP, broadcast, workflow, воркер, DLQ, Docker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-1">Регистрация агента и первое сообщение (SDK)</h4>
              <p>Запуск AMB → createClient → registerAgent → createThread → sendMessage. Получатель: getInbox / pollInbox → обработка → ackMessage.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Задача из Cursor (MCP)</h4>
              <p>В чате: «Создай тред и отправь задачу агенту dev». ИИ вызывает create_thread → list_agents → send_message.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Broadcast</h4>
              <p>sendMessage с toAgentId: null — все агенты видят сообщение в inbox.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Workflow PO → Architect → Dev → QA</h4>
              <p>Скрипт: создать тред, по шагам sendMessage по ролям, опционально ждать ответ, закрыть тред. Пример: pnpm orchestrator.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Воркер агента</h4>
              <p>pollInbox(agentId) в цикле, обработка по payload.type, ackMessage. При падении — retry/DLQ.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Мониторинг и DLQ</h4>
              <p>Dashboard или GET /api/dlq → retry одного или retry-all через API / client.retryDLQMessage / retryAllDLQ.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">AMB как сервис</h4>
              <p>docker compose up -d; своё приложение подключается по HTTP или через SDK к URL AMB.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сводная таблица</CardTitle>
            <CardDescription>Сценарий → подключение → основные операции</CardDescription>
          </CardHeader>
          <CardContent>
            <Table
              headers={["Сценарий", "Подключение", "Основные операции"]}
              rows={summaryTable.map((r) => ({
                Сценарий: r.scenario,
                Подключение: r.connection,
                "Основные операции": r.ops,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2Icon className="size-5" />
              Документация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
                  <Link href="/api-docs" target="_blank" rel="noopener noreferrer">
                    <BookOpenIcon className="size-4" />
                    Документация API (Swagger)
                  </Link>
                </Button>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Полная версия сценариев в репозитории: <code className="rounded bg-muted px-1">docs/use-cases.md</code>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
