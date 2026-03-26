"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AgentsList } from "./agents-list"
import { ThreadsList } from "./threads-list"
import { ThreadViewer } from "./thread-viewer"
import { InboxViewer } from "./inbox-viewer"
import { DlqViewer } from "./dlq-viewer"
import { ProjectSwitcher } from "./project-switcher"
import { DashboardEmptyState } from "./dashboard-empty-state"
import { useProjectContext } from "@/lib/context/project-context"
import { CommandPalette, useCommandPalette } from "./command-palette"
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts"
import { useSSE } from "@/lib/hooks/use-sse"
import {
  MessageSquareIcon,
  InboxIcon,
  AlertTriangleIcon,
  CommandIcon,
  Bus as BusIcon,
  SunIcon,
  MoonIcon,
  GripVerticalIcon,
  BookOpenIcon,
  HelpCircleIcon,
  LogOutIcon,
  MoreVerticalIcon,
} from "lucide-react"
import { Link, useRouter, usePathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "@/components/theme-provider"
import { useLocale, useTranslations } from "next-intl"

type TabValue = "messages" | "inbox" | "dlq"

// Resizer component
function ColumnResizer({ onResize }: { onResize: (delta: number) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startXRef.current = e.clientX
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current
      startXRef.current = e.clientX
      onResize(delta)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, onResize])

  return (
    <div
      className={`w-1 flex-shrink-0 cursor-col-resize group hover:bg-primary/20 transition-colors relative ${
        isDragging ? "bg-primary/30" : ""
      }`}
      onMouseDown={handleMouseDown}
    >
      <div className={`absolute inset-y-0 -left-1 -right-1 flex items-center justify-center ${
        isDragging ? "bg-primary/10" : ""
      }`}>
        <GripVerticalIcon className={`size-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity ${
          isDragging ? "opacity-100 text-primary" : ""
        }`} />
      </div>
    </div>
  )
}

export function Dashboard() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabValue>("messages")
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Column widths (resizable)
  const [agentsWidth, setAgentsWidth] = useState(320)
  const [threadsWidth, setThreadsWidth] = useState(384)
  
  // Command palette
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette()

  // Get counts for badges via SSE
  const { inboxCounts, dlqCount, connected } = useSSE()
  
  // Theme
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("Dashboard")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { projects, loading: projectsLoading } = useProjectContext()
  const showNoProjectsEmpty = !projectsLoading && projects.length === 0
  
  const toggleTheme = useCallback(() => {
    // Переключаем на явную тему (не "system")
    const currentResolved = resolvedTheme
    setTheme(currentResolved === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])
  
  // Inbox count for selected agent
  const inboxCount = selectedAgentId ? (inboxCounts[selectedAgentId] ?? 0) : 0

  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  const setLocale = useCallback(
    (newLocale: string) => {
      document.cookie = `NEXT_LOCALE=${newLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
      window.localStorage.setItem("amb:locale", newLocale)
      router.replace(pathname, { locale: newLocale })
    },
    [router, pathname]
  )

  const redirectToLogin = useCallback(() => {
    const nextPath = `${window.location.pathname}${window.location.search}`
    window.location.href = `/${locale}/login?next=${encodeURIComponent(nextPath)}`
  }, [locale])

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      redirectToLogin()
    }
  }, [redirectToLogin])

  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" })
        if (!response.ok) {
          if (isMounted) redirectToLogin()
          return
        }
        const json = await response.json().catch(() => null)
        if (!json?.data?.authenticated && isMounted) {
          redirectToLogin()
        }
      } catch {
        // ignore transient network errors in session polling
      }
    }

    void checkSession()
    const intervalId = setInterval(() => {
      void checkSession()
    }, 60_000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [redirectToLogin])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    goToMessages: () => setActiveTab("messages"),
    goToInbox: () => setActiveTab("inbox"),
    goToDlq: () => setActiveTab("dlq"),
    search: () => searchInputRef.current?.focus(),
    refresh: handleRefresh,
    newThread: () => setShowNewThreadDialog(true),
  })

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header — billing-style: fixed height, elevation shadow */}
      <header className="flex h-16 shrink-0 items-center border-b bg-card shadow-elevation sticky top-0 z-10">
        <div className="flex w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <BusIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                {t("title")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ProjectSwitcher />

            {/* SSE status — compact, tooltip only */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="flex size-8 items-center justify-center rounded-md border-0 bg-transparent"
                  aria-label={connected ? t("sseConnected") : t("reconnecting")}
                >
                  <span
                    className={`block size-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {connected ? t("sseConnected") : t("reconnecting")}
                {connected && ` — ${t("realtime")}`}
              </TooltipContent>
            </Tooltip>

            {/* Command palette — primary action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="gap-2 text-muted-foreground"
            >
              <CommandIcon className="size-4" />
              <span className="hidden sm:inline">{t("commands")}</span>
              <kbd className="hidden sm:inline-flex ml-1 h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px]">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Theme toggle — in panel */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="size-9"
              title={resolvedTheme === "dark" ? t("lightTheme") : t("darkTheme")}
            >
              {resolvedTheme === "dark" ? (
                <SunIcon className="size-4" />
              ) : (
                <MoonIcon className="size-4" />
              )}
            </Button>

            {/* More — secondary actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9" title={t("more")}>
                  <MoreVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[10rem]">
                <DropdownMenuItem asChild>
                  <a href="/api-docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <BookOpenIcon className="size-4" />
                    {t("apiDocs")}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="flex items-center gap-2">
                    <HelpCircleIcon className="size-4" />
                    {t("help")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    {tCommon("language")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {routing.locales.map((loc) => (
                      <DropdownMenuItem
                        key={loc}
                        onClick={() => setLocale(loc)}
                        className={locale === loc ? "bg-accent" : ""}
                      >
                        {loc === "en" ? "English" : loc === "ru" ? "Русский" : loc === "de" ? "Deutsch" : loc}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2">
                  <LogOutIcon className="size-4" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {showNoProjectsEmpty ? (
          <DashboardEmptyState />
        ) : (
          <>
            <aside
              className="flex-shrink-0 overflow-hidden border-r border-border bg-card shadow-elevation"
              style={{ width: agentsWidth, minWidth: 200, maxWidth: 500 }}
            >
              <AgentsList
                selectedAgentId={selectedAgentId}
                onSelectAgent={setSelectedAgentId}
                searchInputRef={searchInputRef}
                inboxCounts={inboxCounts}
              />
            </aside>

            <ColumnResizer
              onResize={(delta) => setAgentsWidth((w) => Math.max(200, Math.min(500, w + delta)))}
            />

            <aside
              className="flex-shrink-0 overflow-hidden border-r border-border bg-card shadow-elevation"
              style={{ width: threadsWidth, minWidth: 250, maxWidth: 600 }}
            >
              <ThreadsList
                selectedThreadId={selectedThreadId}
                onSelectThread={setSelectedThreadId}
                externalDialogOpen={showNewThreadDialog}
                onExternalDialogChange={setShowNewThreadDialog}
              />
            </aside>

            <ColumnResizer
              onResize={(delta) => setThreadsWidth((w) => Math.max(250, Math.min(600, w + delta)))}
            />

            <main className="flex flex-1 flex-col overflow-hidden bg-background">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as TabValue)}
                className="flex h-full flex-col"
              >
                <div className="border-b px-4 pt-2">
                  <TabsList className="h-10 bg-transparent p-0 gap-1">
                    <TabsTrigger
                      value="messages"
                      className="relative gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                      <MessageSquareIcon className="size-4" />
                      {t("messages")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="inbox"
                      className="relative gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                      <InboxIcon className="size-4" />
                      {t("inbox")}
                      {inboxCount > 0 && (
                        <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-medium text-white">
                          {inboxCount > 99 ? "99+" : inboxCount}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="dlq"
                      className="relative gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                      <AlertTriangleIcon className="size-4" />
                      {t("errors")}
                      {dlqCount > 0 && (
                        <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-white">
                          {dlqCount > 99 ? "99+" : dlqCount}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="messages" className="m-0 flex-1 overflow-hidden p-4 md:p-6">
                  <ThreadViewer threadId={selectedThreadId} currentAgentId={selectedAgentId} />
                </TabsContent>

                <TabsContent value="inbox" className="m-0 flex-1 overflow-hidden p-4 md:p-6">
                  <InboxViewer agentId={selectedAgentId} />
                </TabsContent>

                <TabsContent value="dlq" className="m-0 flex-1 overflow-hidden p-4 md:p-6">
                  <DlqViewer />
                </TabsContent>
              </Tabs>
            </main>
          </>
        )}
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onNavigate={setActiveTab}
        onNewThread={() => setShowNewThreadDialog(true)}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
