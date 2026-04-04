"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@amb-app/ui/components/tabs"
import { AgentsList } from "./agents-list"
import { ThreadsList } from "./threads-list"
import { ThreadViewer } from "./thread-viewer"
import { InboxViewer } from "./inbox-viewer"
import { DlqViewer } from "./dlq-viewer"
import { DashboardEmptyState } from "./dashboard-empty-state"
import { useProjectContext } from "@/lib/context/project-context"
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts"
import { useSSE } from "@/lib/hooks/use-sse"
import { MessageSquareIcon, InboxIcon, AlertTriangleIcon, GripVerticalIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useIsClient } from "@/lib/hooks/use-is-client"
import { useShellCommandHandlersRef } from "@/components/layout/shell-command-handlers"

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
      className={`w-1 flex-shrink-0 cursor-col-resize border-x border-transparent transition-colors hover:border-primary/20 hover:bg-primary/10 group relative ${
        isDragging ? "border-primary/35 bg-primary/20" : ""
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
  
  const { inboxCounts, dlqCount } = useSSE()
  const t = useTranslations("Dashboard")
  const { projects, projectId, loading: projectsLoading } = useProjectContext()
  const showNoProjectsEmpty = !projectsLoading && projects.length === 0
  /** Avoid one frame / effect tick with agents+threads mounted but projectId not yet synced from context. */
  const projectContextSyncing = !projectsLoading && projects.length > 0 && projectId == null
  const handlersRef = useShellCommandHandlersRef()

  const inboxCount = selectedAgentId ? (inboxCounts[selectedAgentId] ?? 0) : 0

  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  useEffect(() => {
    handlersRef.current = {
      onNavigate: setActiveTab,
      onNewThread: () => setShowNewThreadDialog(true),
      onRefresh: handleRefresh,
    }
    return () => {
      handlersRef.current = null
    }
  }, [handlersRef, handleRefresh])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    goToMessages: () => setActiveTab("messages"),
    goToInbox: () => setActiveTab("inbox"),
    goToDlq: () => setActiveTab("dlq"),
    search: () => searchInputRef.current?.focus(),
    refresh: handleRefresh,
    newThread: () => setShowNewThreadDialog(true),
  })

  const isClient = useIsClient()

  if (!isClient) {
    return (
      <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center bg-background" aria-busy="true">
        <div className="h-32 w-full max-w-xl rounded-lg border border-dashed border-muted-foreground/25 bg-muted/10" />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col !bg-transparent">
      <div className="flex min-h-0 flex-1 gap-1.5 overflow-hidden">
        {showNoProjectsEmpty ? (
          <DashboardEmptyState />
        ) : projectContextSyncing ? (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16"
            aria-busy="true"
          >
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            <p className="text-sm text-muted-foreground">{t("loadingWorkspace")}</p>
          </div>
        ) : (
          <>
            <aside
              className="amb-shell-panel flex min-h-0 min-w-0 flex-shrink-0 flex-col overflow-hidden rounded-xl"
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
              className="amb-shell-panel flex min-h-0 min-w-0 flex-shrink-0 flex-col overflow-hidden rounded-xl"
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

            <main className="amb-shell-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as TabValue)}
                className="flex h-full flex-col"
              >
                <div className="border-b px-5 pt-2.5 md:px-6">
                  <TabsList className="h-10 bg-transparent p-0 gap-1">
                    <TabsTrigger
                      value="messages"
                      className="relative gap-1.5 rounded-b-none border-b-2 border-transparent font-mono text-xs uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <MessageSquareIcon className="size-4" />
                      {t("messages")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="inbox"
                      className="relative gap-1.5 rounded-b-none border-b-2 border-transparent font-mono text-xs uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:shadow-sm"
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
                      className="relative gap-1.5 rounded-b-none border-b-2 border-transparent font-mono text-xs uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:shadow-sm"
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

                <TabsContent value="messages" className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-5 md:p-6">
                  <ThreadViewer threadId={selectedThreadId} currentAgentId={selectedAgentId} />
                </TabsContent>

                <TabsContent value="inbox" className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-5 md:p-6">
                  <InboxViewer agentId={selectedAgentId} />
                </TabsContent>

                <TabsContent value="dlq" className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-5 md:p-6">
                  <DlqViewer />
                </TabsContent>
              </Tabs>
            </main>
          </>
        )}
      </div>
    </div>
  )
}
