"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useThreadMessages } from "@/lib/hooks/use-messages";
import { useAgents } from "@/lib/hooks/use-agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

type Props = {
  threadId: string | null;
  currentAgentId: string | null;
};

const statusConfig = {
  pending: {
    icon: ClockIcon,
    color: "text-yellow-500",
    label: "Pending",
    variant: "outline" as const,
  },
  delivered: {
    icon: CheckIcon,
    color: "text-blue-500",
    label: "Delivered",
    variant: "secondary" as const,
  },
  ack: {
    icon: CheckCheckIcon,
    color: "text-green-500",
    label: "Acknowledged",
    variant: "default" as const,
  },
  dlq: {
    icon: AlertTriangleIcon,
    color: "text-destructive",
    label: "Failed",
    variant: "destructive" as const,
  },
};

// Group messages by date
function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentGroup: { date: string; messages: Message[] } | null = null;

  for (const msg of messages) {
    const date = new Date(msg.createdAt).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!currentGroup || currentGroup.date !== date) {
      currentGroup = { date, messages: [] };
      groups.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  }

  return groups;
}

export function ThreadViewer({ threadId, currentAgentId }: Props) {
  const { messages, loading, sendMessage, refetch } = useThreadMessages(threadId);
  const { agents } = useAgents();
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedToAgent, setSelectedToAgent] = useState<Agent | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const agentMap = useMemo(
    () => new Map(agents.map((a) => [a.id, a])),
    [agents]
  );
  const currentAgent = currentAgentId ? agentMap.get(currentAgentId) : null;

  const messageGroups = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
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
        <p className="font-medium">No thread selected</p>
        <p className="text-sm mt-1">Select a thread from the list to view messages</p>
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageSquareIcon className="size-4 text-muted-foreground" />
            <span className="font-medium text-sm">Messages</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {messages.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {currentAgent && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <span>Sending as</span>
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
            <TooltipContent>Refresh messages</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 relative" onScrollCapture={handleScroll}>
        <div ref={scrollAreaRef} className="p-4 space-y-6">
          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin mb-2" />
              <p className="text-sm">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquareIcon className="size-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">
                {currentAgentId
                  ? "Send the first message to start the conversation"
                  : "Select an agent to send messages"}
              </p>
            </div>
          ) : (
            messageGroups.map((group) => (
              <div key={group.date}>
                {/* Date divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground font-medium px-2">
                    {group.date}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {group.messages.map((msg) => {
                    const fromAgent = agentMap.get(msg.fromAgentId);
                    const toAgent = msg.toAgentId
                      ? agentMap.get(msg.toAgentId)
                      : null;
                    const isOwn = msg.fromAgentId === currentAgentId;
                    const payload = msg.payload as { text?: string } | null;
                    const status = statusConfig[msg.status as keyof typeof statusConfig] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isOwn ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Agent info */}
                        <div
                          className={`flex items-center gap-1.5 mb-1 px-1 ${
                            isOwn ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center size-5 rounded-full ${
                              fromAgent?.status === "online"
                                ? "bg-green-500/10 text-green-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <BotIcon className="size-3" />
                          </div>
                          <span className="text-xs font-medium">
                            {fromAgent?.name || msg.fromAgentId.slice(0, 8)}
                          </span>
                          {toAgent && (
                            <span className="text-xs text-muted-foreground">
                              → {toAgent.name}
                            </span>
                          )}
                        </div>

                        {/* Message bubble */}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {payload?.text || JSON.stringify(msg.payload)}
                          </p>
                        </div>

                        {/* Status and time */}
                        <div
                          className={`flex items-center gap-1.5 mt-1 px-1 ${
                            isOwn ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <Tooltip>
                            <TooltipTrigger>
                              <StatusIcon className={`size-3 ${status.color}`} />
                            </TooltipTrigger>
                            <TooltipContent>{status.label}</TooltipContent>
                          </Tooltip>
                          {msg.retries > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              (retry {msg.retries})
                            </span>
                          )}
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

      {/* Input area */}
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
                ? "Выберите агента для отправки"
                : "Введите сообщение... (используйте @ для упоминания)"
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
            <TooltipContent>Отправить (Enter)</TooltipContent>
          </Tooltip>
        </div>
        {!currentAgentId && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Выберите агента в боковой панели для отправки сообщений
          </p>
        )}
      </div>
    </div>
  );
}
