"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useThreadMessages } from "@/lib/hooks/use-messages";
import { useAgents } from "@/lib/hooks/use-agents";
import { Badge } from "@amb-app/ui/components/badge";
import { Button } from "@amb-app/ui/components/button";
import { ScrollArea } from "@amb-app/ui/components/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@amb-app/ui/components/tooltip";
import {
  SendIcon,
  RefreshCwIcon,
  MessageSquareIcon,
  Loader2Icon,
  BotIcon,
  ClockIcon,
  CheckIcon,
  CheckCheckIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
} from "lucide-react";
import type { Agent, Message } from "@/lib/types";
import { MentionInput } from "./mention-input";
import { AgentSelector } from "./agent-selector";
import { extractToAgentId } from "@/lib/mentions";
import { JsonViewer } from "@amb-app/ui/components/json-viewer";
import { groupMessagesByDate, parseMessageSegments } from "./thread-viewer/MessageUtils";

type Props = {
  threadId: string | null;
  currentAgentId: string | null;
};

const statusConfig = {
  pending: {
    icon: ClockIcon,
    color: "text-yellow-500",
    variant: "outline" as const,
  },
  delivered: {
    icon: CheckIcon,
    color: "text-blue-500",
    variant: "secondary" as const,
  },
  ack: {
    icon: CheckCheckIcon,
    color: "text-green-500",
    variant: "default" as const,
  },
  dlq: {
    icon: AlertTriangleIcon,
    color: "text-destructive",
    variant: "destructive" as const,
  },
};

export function ThreadViewer({ threadId, currentAgentId }: Props) {
  const t = useTranslations("ThreadViewer");
  const statusLabels = {
    pending: t("status.pending"),
    delivered: t("status.delivered"),
    ack: t("status.ack"),
    dlq: t("status.dlq"),
  } as const;
  const { messages, loading, sendMessage, refetch } = useThreadMessages(threadId);
  const { agents } = useAgents();
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedToAgent, setSelectedToAgent] = useState<Agent | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const wasNearBottomRef = useRef(true);
  const previousMessagesCountRef = useRef(0);

  const agentMap = useMemo(
    () => new Map(agents.map((a) => [a.id, a])),
    [agents]
  );
  const currentAgent = currentAgentId ? agentMap.get(currentAgentId) : null;

  const messageGroups = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  // Auto-scroll to bottom only if user was already at bottom and new messages arrived
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !bottomRef.current) return;

    const isNearBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 100;
    
    const previousCount = previousMessagesCountRef.current;
    const currentCount = messages.length;
    const hasNewMessages = currentCount > previousCount;
    const isFirstLoad = previousCount === 0 && currentCount > 0;
    
    previousMessagesCountRef.current = currentCount;

    // Only auto-scroll if:
    // 1. It's the first load (initial messages), OR
    // 2. New messages arrived AND user was near bottom before update
    if (isFirstLoad || (hasNewMessages && wasNearBottomRef.current)) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      wasNearBottomRef.current = true;
    } else {
      // Update ref with current position
      wasNearBottomRef.current = isNearBottom;
    }
  }, [messages]);

  // Poll every 3 seconds
  useEffect(() => {
    if (!threadId) return;
    const interval = setInterval(refetch, 3000);
    return () => clearInterval(interval);
  }, [threadId, refetch]);


  // Handle scroll to detect when user scrolled up
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    wasNearBottomRef.current = isNearBottom;
    setShowScrollButton(!isNearBottom);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Определяем toAgentId: приоритет у dropdown, затем @mentions
  const resolveToAgentId = useCallback(
    (text: string): string | null => {
      // Если выбран агент через dropdown - используем его
      if (selectedToAgent) {
        return selectedToAgent.id;
      }
      // Иначе извлекаем из @mentions в тексте
      return extractToAgentId(text, agents);
    },
    [selectedToAgent, agents]
  );

  const handleSend = async () => {
    if (!messageText.trim() || !currentAgentId) return;

    const text = messageText.trim();
    const toAgentId = resolveToAgentId(text);
    
    setMessageText("");
    setSelectedToAgent(null); // Сбрасываем выбор после отправки
    setSending(true);

    try {
      await sendMessage({
        fromAgentId: currentAgentId,
        toAgentId,
        payload: { text },
      });
    } catch {
      // Restore message on error
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  if (!threadId) {
    return (
      <div className="h-full rounded-lg border bg-card flex flex-col items-center justify-center text-muted-foreground">
        <MessageSquareIcon className="size-12 mb-4 opacity-20" />
        <p className="font-medium">{t("noThreadSelected")}</p>
        <p className="text-sm mt-1">{t("selectThreadToView")}</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 rounded-lg border bg-card flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
              <MessageSquareIcon className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">{t("messages")}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {messages.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {currentAgent && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <span>{t("sendingAs")}</span>
              <Badge variant="outline" className="gap-1">
                <BotIcon className="size-3" />
                {currentAgent.name}
              </Badge>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={refetch}
              >
                <RefreshCwIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("refreshMessages")}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 relative" onScrollCapture={handleScroll}>
        <div 
          ref={(node) => {
            scrollAreaRef.current = node;
            // Find viewport element (parent of our content div)
            if (node) {
              const viewport = node.closest('[data-slot="scroll-area-viewport"]') as HTMLDivElement;
              if (viewport) {
                viewportRef.current = viewport;
              }
            }
          }} 
          className="p-4 space-y-6"
        >
          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin mb-2" />
              <p className="text-sm">{t("loadingMessages")}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquareIcon className="size-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">{t("noMessagesYet")}</p>
              <p className="text-xs mt-1">
                {currentAgentId
                  ? t("sendFirstMessage")
                  : t("selectAgentToSend")}
              </p>
            </div>
          ) : (
            messageGroups.map((group) => (
              <div key={group.date}>
                {/* Date divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="thread-date-divider px-2">
                    {group.date}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Messages */}
                <div className="space-y-4">
                  {group.messages.map((msg) => {
                    const fromAgent = agentMap.get(msg.fromAgentId);
                    const toAgent = msg.toAgentId
                      ? agentMap.get(msg.toAgentId)
                      : null;
                    const isOwn = msg.fromAgentId === currentAgentId;
                    const payload = msg.payload as { text?: string; type?: string } | null;
                    const statusKey = msg.status as keyof typeof statusConfig;
                    const status = statusConfig[statusKey] || statusConfig.pending;
                    const statusLabel = statusLabels[statusKey] ?? statusLabels.pending;
                    const StatusIcon = status.icon;
                    const isBroadcast = !msg.toAgentId;
                    const textSegments = payload?.text ? parseMessageSegments(payload.text) : [];

                    return (
                      <div
                        key={msg.id}
                        className={`thread-message-card group ${isOwn ? "thread-message-card--own" : ""}`}
                      >
                        {/* Header */}
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex items-center justify-center size-8 rounded-full ${
                                fromAgent?.status === "online"
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <BotIcon className="size-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">
                                  {fromAgent?.name || msg.fromAgentId.slice(0, 8)}
                                </p>
                                {toAgent && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                                    → {toAgent.name}
                                  </Badge>
                                )}
                                {isBroadcast && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                                    {t("broadcast")}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {fromAgent?.role || t("unknownRole")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="thread-message-content mb-3">
                          {/* Payload type indicator */}
                          {payload?.type && payload.type !== "text" && (
                            <div className="text-[11px] font-medium uppercase tracking-wider mb-2 text-muted-foreground">
                              {payload.type}
                            </div>
                          )}
                          {payload?.text ? (
                            <div className="space-y-2.5">
                              {textSegments.map((segment, idx) =>
                                segment.type === "code" ? (
                                  <div key={`${msg.id}-code-${idx}`} className="space-y-1.5">
                                    {segment.language ? (
                                      <span className="thread-code-language">{segment.language}</span>
                                    ) : null}
                                    <pre className="thread-code-block">
                                      <code>{segment.content}</code>
                                    </pre>
                                  </div>
                                ) : (
                                  <p key={`${msg.id}-text-${idx}`} className="thread-message-text">
                                    {segment.content}
                                  </p>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-sm">
                              <JsonViewer data={msg.payload} />
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="size-3" />
                            <span>
                              {new Date(msg.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="flex items-center gap-1"
                              role="status"
                              aria-label={t("messageStatus", { status: statusLabel })}
                            >
                              <StatusIcon className={`size-3 ${status.color}`} aria-hidden="true" />
                              <span className={`text-xs font-medium ${status.color}`}>
                                {statusLabel}
                              </span>
                            </div>
                            {msg.retries > 0 && (
                              <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5">
                                retry {msg.retries}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-4 right-4 size-8 rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            <ChevronDownIcon className="size-4" />
          </Button>
        )}
      </ScrollArea>

      <div className="p-4 border-t bg-card/50">
        <div className="flex gap-2">
          <AgentSelector
            agents={agents}
            selectedAgent={selectedToAgent}
            onSelect={setSelectedToAgent}
            disabled={!currentAgentId || sending}
            currentAgentId={currentAgentId}
          />
          <MentionInput
            value={messageText}
            onChange={setMessageText}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            agents={agents}
            placeholder={
              !currentAgentId
                ? t("selectAgentPlaceholder")
                : t("messagePlaceholder")
            }
            disabled={!currentAgentId || sending}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!currentAgentId || !messageText.trim() || sending}
              >
                {sending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <SendIcon className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("sendEnter")}</TooltipContent>
          </Tooltip>
        </div>
        {!currentAgentId && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {t("selectAgentSidebar")}
          </p>
        )}
      </div>
    </div>
  );
}
