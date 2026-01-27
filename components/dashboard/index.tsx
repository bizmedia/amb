"use client"

import { useState, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AgentsList } from "./agents-list"
import { ThreadsList } from "./threads-list"
import { ThreadViewer } from "./thread-viewer"
import { InboxViewer } from "./inbox-viewer"
import { DlqViewer } from "./dlq-viewer"
import { CommandPalette, useCommandPalette } from "./command-palette"
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts"
import { useInbox } from "@/lib/hooks/use-messages"
import { useDlq } from "@/lib/hooks/use-messages"
import {
  MessageSquareIcon,
  InboxIcon,
  AlertTriangleIcon,
  CommandIcon,
  ActivityIcon,
} from "lucide-react"

type TabValue = "messages" | "inbox" | "dlq"

export function Dashboard() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabValue>("messages")
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Command palette
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette()

  // Get counts for badges
  const { messages: inboxMessages } = useInbox(selectedAgentId)
  const { messages: dlqMessages } = useDlq()

  const inboxCount = inboxMessages.length
  const dlqCount = dlqMessages.length

  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

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
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <ActivityIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Agent Message Bus
              </h1>
              <p className="text-xs text-muted-foreground">
                Панель управления сообщениями
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicators */}
            <div className="flex items-center gap-4 mr-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Подключено
              </span>
              <span>Обновление: 3с</span>
            </div>

            {/* Command palette button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="gap-2 text-muted-foreground"
            >
              <CommandIcon className="size-4" />
              <span className="hidden sm:inline">Команды</span>
              <kbd className="hidden sm:inline-flex ml-1 h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px]">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar: Agents */}
        <aside className="w-72 border-r flex-shrink-0 overflow-hidden bg-card/30">
          <AgentsList
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            searchInputRef={searchInputRef}
          />
        </aside>

        {/* Middle sidebar: Threads */}
        <aside className="w-80 border-r flex-shrink-0 overflow-hidden bg-card/30">
          <ThreadsList
            selectedThreadId={selectedThreadId}
            onSelectThread={setSelectedThreadId}
            externalDialogOpen={showNewThreadDialog}
            onExternalDialogChange={setShowNewThreadDialog}
          />
        </aside>

        {/* Main area: Tabs */}
        <main className="flex-1 overflow-hidden bg-background">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="h-full flex flex-col"
          >
            <div className="border-b px-4 pt-2">
              <TabsList className="h-10 bg-transparent p-0 gap-1">
                <TabsTrigger
                  value="messages"
                  className="relative gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <MessageSquareIcon className="size-4" />
                  Сообщения
                  <kbd className="ml-1 h-4 px-1 rounded bg-muted text-[10px] font-mono hidden sm:inline-flex items-center">
                    1
                  </kbd>
                </TabsTrigger>
                <TabsTrigger
                  value="inbox"
                  className="relative gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <InboxIcon className="size-4" />
                  Входящие
                  {inboxCount > 0 && (
                    <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-medium text-white">
                      {inboxCount > 99 ? "99+" : inboxCount}
                    </span>
                  )}
                  <kbd className="ml-1 h-4 px-1 rounded bg-muted text-[10px] font-mono hidden sm:inline-flex items-center">
                    2
                  </kbd>
                </TabsTrigger>
                <TabsTrigger
                  value="dlq"
                  className="relative gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <AlertTriangleIcon className="size-4" />
                  Ошибки
                  {dlqCount > 0 && (
                    <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-white">
                      {dlqCount > 99 ? "99+" : dlqCount}
                    </span>
                  )}
                  <kbd className="ml-1 h-4 px-1 rounded bg-muted text-[10px] font-mono hidden sm:inline-flex items-center">
                    3
                  </kbd>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="messages" className="flex-1 overflow-hidden m-0 p-4">
              <ThreadViewer
                threadId={selectedThreadId}
                currentAgentId={selectedAgentId}
              />
            </TabsContent>

            <TabsContent value="inbox" className="flex-1 overflow-hidden m-0 p-4">
              <InboxViewer agentId={selectedAgentId} />
            </TabsContent>

            <TabsContent value="dlq" className="flex-1 overflow-hidden m-0 p-4">
              <DlqViewer />
            </TabsContent>
          </Tabs>
        </main>
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
